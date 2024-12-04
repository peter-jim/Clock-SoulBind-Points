let Clock;

async function initializeClock() {
  const vlc = await import('verifiable-logical-clock');
  Clock = vlc.Clock;
}

class CSBPClock {
  constructor(storage) {
    if (!Clock) {
      throw new Error('Clock not initialized. Please call initializeClock() first.');
    }
    this.storage = storage;
    this.clocks = new Map(); // Map<pubkey:projectId:eventType, Clock>
    this.clockValues = new Map(); // Map<pubkey:projectId:eventType, number>
  }

  // Get composite key for clock instances
  getClockKey(pubkey, projectId, eventType) {
    return `${pubkey}:${projectId}:${eventType}`;
  }

  // Get or create clock instance for specific context
  getClockInstance(pubkey, projectId, eventType) {
    const key = this.getClockKey(pubkey, projectId, eventType);
    if (!this.clocks.has(key)) {
      this.clocks.set(key, new Clock());
      this.clockValues.set(key, 0);
    }
    return {
      clock: this.clocks.get(key),
      value: this.clockValues.get(key)
    };
  }

  // Initialize clock state from storage
  async initFromStorage(pubkey, projectId, eventType) {
    try {
      // Get all events for this context
      const events = await this.storage.getAllEvents(pubkey, projectId, eventType);
      if (events.length === 0) return 0;

      // Sort events by clock value
      events.sort((a, b) => a.clockValue - b.clockValue);
      
      // Create new clock instance
      const key = this.getClockKey(pubkey, projectId, eventType);
      const clock = new Clock();
      let lastValue = 0;

      // Replay events
      for (const record of events) {
        clock.inc(record.event.id);
        lastValue = record.clockValue;
      }

      // Store clock instance
      this.clocks.set(key, clock);
      this.clockValues.set(key, lastValue);

      console.log(`Restored clock state for ${pubkey}/${projectId}/${eventType} with ${events.length} events, last value: ${lastValue}`);
      return events.length;
    } catch (error) {
      console.error('Failed to initialize clock from storage:', error);
      throw error;
    }
  }

  async addEventAfterNostrPublish(event, nostrClient, pubkey, projectId, eventType) {
    try {
      console.log('\nStarting event publish process:', {
        eventId: event.id,
        pubkey,
        projectId,
        eventType
      });

      // Get clock instance for this context
      const { clock, value: lastValue } = this.getClockInstance(pubkey, projectId, eventType);
      console.log('Current clock state:', { lastValue });

      // First try to publish to Nostr
      const nostrEvent = await event.toNostrEvent();
      console.log('Created Nostr event:', nostrEvent);

      // Add timeout to publish operation
      const publishWithTimeout = Promise.race([
        nostrClient.publish(nostrEvent),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Publish timeout')), 5000)
        )
      ]);

      try {
        await publishWithTimeout;
        console.log('Successfully published to Nostr');
      } catch (error) {
        console.error('Nostr publish failed:', error);
        throw error;
      }

      // Increment clock and store event
      console.log('Proceeding with clock update and storage');
      
      clock.inc(event.id);
      const newValue = lastValue + 1;
      console.log('Incremented clock value:', newValue);
      
      // Update clock value
      const key = this.getClockKey(pubkey, projectId, eventType);
      this.clockValues.set(key, newValue);

      // Create event record with all necessary fields
      const eventRecord = {
        event: {
          id: event.id,
          type: event.type || 'INVITE',
          data: event.data || {}
        },
        clockValue: newValue,
        nostrId: nostrEvent.id,
        timestamp: Date.now(),
        pubkey,
        projectId,
        eventType
      };

      // Store in database
      console.log('Storing event in database:', {
        eventId: event.id,
        clockValue: newValue,
        nostrId: nostrEvent.id,
        key
      });

      try {
        await this.storage.storeEvent(eventRecord, newValue, pubkey, projectId, eventType);
        console.log('Successfully stored event in database');
      } catch (storageError) {
        console.error('Failed to store event:', storageError);
        // Rollback clock value on storage failure
        this.clockValues.set(key, lastValue);
        throw storageError;
      }

      return newValue;
    } catch (error) {
      console.error('Failed to process event:', error);
      throw error;
    }
  }

  async getEvent(eventId, pubkey, projectId, eventType) {
    try {
      const event = await this.storage.getEvent(eventId, pubkey, projectId, eventType);
      return event;
    } catch (error) {
      console.error('Failed to get event:', error);
      throw error;
    }
  }

  async getAllEvents(pubkey, projectId, eventType) {
    try {
      const events = await this.storage.getAllEvents(pubkey, projectId, eventType);
      return events || []; // 确保返回数组
    } catch (error) {
      console.error('Failed to get events:', error);
      return []; // 错误时返回空数组
    }
  }

  getClockValue(pubkey, projectId, eventType) {
    const key = this.getClockKey(pubkey, projectId, eventType);
    return this.clockValues.get(key) || 0;
  }

  getClockState(pubkey, projectId, eventType) {
    const key = this.getClockKey(pubkey, projectId, eventType);
    const clock = this.clocks.get(key);
    return {
      context: {
        pubkey,
        projectId,
        eventType
      },
      clockValue: this.clockValues.get(key) || 0,
      eventsCount: clock ? Object.keys(clock).length : 0
    };
  }

  // Debug method
  printClockState(pubkey, projectId, eventType) {
    console.log('Clock State:', this.getClockState(pubkey, projectId, eventType));
  }
}

module.exports = { CSBPClock, initializeClock }; 