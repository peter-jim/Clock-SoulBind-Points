const { Level } = require('level');
const path = require('path');

class StorageManager {
  constructor(dbPath = './.clockdb') {
    this.db = new Level(path.resolve(dbPath), { 
      valueEncoding: 'json',
      createIfMissing: true
    });
  }

  // Generate composite key for clock values
  getClockKey(pubkey, projectId, eventType) {
    return `clock:${pubkey}:${projectId}:${eventType}`;
  }

  // Generate composite key for events
  getEventKey(pubkey, projectId, eventType, eventId) {
    return `event:${pubkey}:${projectId}:${eventType}:${eventId}`;
  }

  // Store event with its clock value
  async storeEvent(event, clockValue, pubkey, projectId, eventType) {
    try {
      console.log('\nStoring event:', {
        eventId: event.id,
        clockValue,
        pubkey,
        projectId,
        eventType
      });

      const numericClockValue = Number(clockValue);
      if (isNaN(numericClockValue)) {
        throw new Error(`Invalid clock value: ${clockValue}`);
      }

      // Ensure event is serializable
      const record = {
        event: typeof event.toJSON === 'function' ? event.toJSON() : event,
        clockValue: numericClockValue,
        timestamp: Date.now(),
        nostrId: event.nostrId,
        pubkey,
        projectId,
        eventType
      };

      // Generate keys
      const eventKey = this.getEventKey(pubkey, projectId, eventType, event.id);
      const clockKey = this.getClockKey(pubkey, projectId, eventType);
      
      console.log('Generated storage keys:', {
        eventKey,
        clockKey
      });

      // Store records
      try {
        await this.db.put(eventKey, record);
        await this.db.put(clockKey, numericClockValue);
        await this.db.put(`nostr:${event.nostrId}`, eventKey);
        console.log('Successfully stored event records');
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        throw dbError;
      }

      return record;
    } catch (error) {
      console.error('Error storing event:', error);
      throw error;
    }
  }

  // Get latest clock value for a specific user/project/event combination
  async getLatestClockValue(pubkey, projectId, eventType) {
    try {
      const clockKey = this.getClockKey(pubkey, projectId, eventType);
      return await this.db.get(clockKey);
    } catch (error) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return 0;
      }
      throw error;
    }
  }

  // Get event by ID and context
  async getEvent(eventId, pubkey, projectId, eventType) {
    try {
      const eventKey = this.getEventKey(pubkey, projectId, eventType, eventId);
      return await this.db.get(eventKey);
    } catch (error) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  // Get event by Nostr ID
  async getEventByNostrId(nostrId) {
    try {
      const eventKey = await this.db.get(`nostr:${nostrId}`);
      return await this.db.get(eventKey);
    } catch (error) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  // Get all events for a specific user/project/event combination
  async getAllEvents(pubkey, projectId, eventType) {
    const events = [];
    const prefix = `event:${pubkey}:${projectId}:${eventType}:`;
    
    try {
      for await (const [key, value] of this.db.iterator({
        gte: prefix,
        lte: prefix + '\xFF'
      })) {
        events.push(value);
      }
    } catch (error) {
      console.error('Error getting events:', error);
    }
    return events;
  }

  // Get all clock values for a user
  async getUserClockValues(pubkey) {
    const clocks = {};
    const prefix = `clock:${pubkey}:`;
    
    try {
      for await (const [key, value] of this.db.iterator({
        gte: prefix,
        lte: prefix + '\xFF'
      })) {
        const [, , projectId, eventType] = key.split(':');
        if (!clocks[projectId]) {
          clocks[projectId] = {};
        }
        clocks[projectId][eventType] = value;
      }
    } catch (error) {
      console.error('Error getting clock values:', error);
    }
    return clocks;
  }

  // Close database
  async close() {
    try {
      await this.db.close();
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }

  // Clear all data
  async clear() {
    try {
      for await (const [key] of this.db.iterator()) {
        await this.db.del(key);
      }
      console.log('Database cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  // List all keys (for debugging)
  async listKeys() {
    const keys = [];
    try {
      for await (const [key] of this.db.iterator()) {
        keys.push(key);
      }
      return keys;
    } catch (error) {
      console.error('Error listing keys:', error);
      return [];
    }
  }

  // Debug method to print database state
  async printState() {
    console.log('\nDatabase State:');
    console.log('Keys:', await this.listKeys());
    
    // Print some sample data
    const keys = await this.listKeys();
    for (const key of keys.slice(0, 5)) { // Print first 5 entries
      const value = await this.db.get(key);
      console.log(`\nKey: ${key}`);
      console.log('Value:', value);
    }
  }
}

module.exports = { StorageManager }; 