const { StorageManager } = require('../src/storage');
const { formatTimestamp } = require('../src/utils');

async function listEvents() {
  const storage = new StorageManager();

  try {
    console.log('\n=== Local Database Events ===\n');

    // Get all keys
    const keys = await storage.listKeys();
    console.log('Total keys in database:', keys.length);

    // Collect all events
    const events = [];
    for (const key of keys) {
      if (key.startsWith('event:')) {
        try {
          const record = await storage.db.get(key);
          events.push({
            key,
            ...record
          });
        } catch (error) {
          console.error(`Error reading key ${key}:`, error);
        }
      }
    }

    // Sort events by timestamp
    events.sort((a, b) => b.timestamp - a.timestamp);

    // Print events
    events.forEach((record, index) => {
      console.log('\n-------------------------------------------');
      console.log(`Event ${index + 1}:`);
      console.log('Key:', record.key);
      console.log('ID:', record.event.id);
      console.log('Type:', record.event.type);
      console.log('Clock Value:', record.clockValue);
      console.log('Nostr ID:', record.nostrId);
      console.log('Pubkey:', record.pubkey);
      console.log('Project ID:', record.projectId);
      console.log('Event Type:', record.eventType);
      console.log('Timestamp:', formatTimestamp(record.timestamp));
      console.log('\nEvent Data:');
      console.log(JSON.stringify(record.event.data, null, 2));
    });

    // Print statistics
    console.log('\nDatabase Statistics:');
    console.log('-------------------------------------------');
    console.log('Total Events:', events.length);
    
    // Count unique values
    const stats = {
      pubkeys: new Set(events.map(e => e.pubkey)).size,
      projects: new Set(events.map(e => e.projectId)).size,
      eventTypes: new Set(events.map(e => e.eventType)).size,
      nostrIds: new Set(events.map(e => e.nostrId)).size
    };

    console.log('\nUnique Values:');
    console.log('Pubkeys:', stats.pubkeys);
    console.log('Projects:', stats.projects);
    console.log('Event Types:', stats.eventTypes);
    console.log('Nostr IDs:', stats.nostrIds);

    // Group by status
    const statusStats = events.reduce((acc, record) => {
      const status = record.event.data.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    console.log('\nEvents by Status:', statusStats);

    // Print clock values
    console.log('\nClock Values by Context:');
    const clockKeys = keys.filter(k => k.startsWith('clock:'));
    for (const key of clockKeys) {
      const value = await storage.db.get(key);
      console.log(key + ':', value);
    }

  } catch (error) {
    console.error('Error listing events:', error);
  } finally {
    await storage.close();
  }
}

// Run if called directly
if (require.main === module) {
  listEvents().catch(console.error);
}

module.exports = { listEvents }; 