class StorageManager {
  constructor() {
    this.events = new Map();
    this.clockValues = new Map();
  }

  async storeEvent(event, clockValue, pubkey, projectId, eventType) {
    const eventKey = `event:${pubkey}:${projectId}:${eventType}:${event.id}`;
    const clockKey = `clock:${pubkey}:${projectId}:${eventType}`;

    const record = {
      event: {
        id: event.id,
        type: event.type || 'INVITE',
        data: event.data || {}
      },
      clockValue,
      timestamp: Date.now(),
      nostrId: event.nostrId,
      pubkey,
      projectId,
      eventType
    };

    this.events.set(eventKey, record);
    this.clockValues.set(clockKey, clockValue);

    console.log('Stored event:', {
      key: eventKey,
      record: JSON.stringify(record)
    });

    return record;
  }

  async getEvent(eventId, pubkey, projectId, eventType) {
    const key = `event:${pubkey}:${projectId}:${eventType}:${eventId}`;
    const record = this.events.get(key);
    
    console.log('Getting event:', {
      key,
      found: !!record,
      availableKeys: Array.from(this.events.keys())
    });

    if (!record) {
      return null;
    }

    return record;
  }

  async getAllEvents(pubkey, projectId, eventType) {
    const prefix = `event:${pubkey}:${projectId}:${eventType}:`;
    const events = [];

    console.log('Getting all events:', {
      prefix,
      availableKeys: Array.from(this.events.keys())
    });

    for (const [key, record] of this.events.entries()) {
      if (key.startsWith(prefix)) {
        events.push(record);
      }
    }

    events.sort((a, b) => a.clockValue - b.clockValue);

    console.log('Retrieved events:', {
      count: events.length,
      events: events.map(e => ({
        id: e.event.id,
        clockValue: e.clockValue,
        key: `${prefix}${e.event.id}`
      }))
    });

    return events;
  }

  async getLatestClockValue(pubkey, projectId, eventType) {
    const key = `clock:${pubkey}:${projectId}:${eventType}`;
    return this.clockValues.get(key) || 0;
  }

  async clear() {
    this.events.clear();
    this.clockValues.clear();
  }

  async close() {
    // No-op for mock
  }

  // Debug method
  async printState() {
    console.log('\nStorage State:');
    console.log('Events:', Array.from(this.events.entries()).map(([k, v]) => [k, {
      id: v.event.id,
      clockValue: v.clockValue,
      pubkey: v.pubkey,
      projectId: v.projectId,
      eventType: v.eventType
    }]));
    console.log('Clock Values:', Array.from(this.clockValues.entries()));
  }
}

module.exports = { StorageManager }; 