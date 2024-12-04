const { StorageManager } = require('../src/storage');
const { formatTimestamp } = require('../src/utils');

async function queryUserEvents(pubkey) {
  const storage = new StorageManager();

  try {
    console.log('\n=== Query User Events ===\n');
    console.log('Querying events for pubkey:', pubkey);

    // Get all keys
    const keys = await storage.listKeys();
    const userEventKeys = keys.filter(key => key.startsWith(`event:${pubkey}:`));
    
    if (userEventKeys.length === 0) {
      console.log('\nNo events found for this user');
      return;
    }

    // Collect all events for this user
    const events = [];
    for (const key of userEventKeys) {
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

    // Sort events by timestamp (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    // Print events
    console.log(`\nFound ${events.length} events:\n`);
    events.forEach((record, index) => {
      console.log('-------------------------------------------');
      console.log(`Event ${index + 1}:`);
      console.log('Key:', record.key);
      console.log('ID:', record.event.id);
      console.log('Type:', record.event.type);
      console.log('Clock Value:', record.clockValue);
      console.log('Nostr ID:', record.nostrId);
      console.log('Project ID:', record.projectId);
      console.log('Event Type:', record.eventType);
      console.log('Timestamp:', formatTimestamp(record.timestamp));
      console.log('\nEvent Data:');
      console.log(JSON.stringify(record.event.data, null, 2));
    });

    // Print user statistics
    console.log('\nUser Statistics:');
    console.log('-------------------------------------------');
    
    // Count unique values
    const stats = {
      totalEvents: events.length,
      projects: new Set(events.map(e => e.projectId)).size,
      eventTypes: new Set(events.map(e => e.eventType)).size,
      nostrIds: new Set(events.map(e => e.nostrId)).size
    };

    console.log('Total Events:', stats.totalEvents);
    console.log('Unique Projects:', stats.projects);
    console.log('Event Types:', stats.eventTypes);
    console.log('Nostr IDs:', stats.nostrIds);

    // Print clock values for each project/event type combination
    console.log('\nClock Values:');
    const clockKeys = keys.filter(k => k.startsWith(`clock:${pubkey}:`));
    for (const key of clockKeys) {
      const value = await storage.db.get(key);
      console.log(key + ':', value);
    }

  } catch (error) {
    console.error('Error querying events:', error);
  } finally {
    await storage.close();
  }
}

// Show usage if no pubkey provided
if (process.argv.length < 3) {
  console.log('Usage: node query-local-db.js <pubkey>');
  console.log('\nExample:');
  console.log('  node query-local-db.js 812c1ccc37c1e40f68aa41ce19be1f6155c8d7428b164eff071b37472ce240ec');
  process.exit(1);
}

// Run query with provided pubkey
const pubkey = process.argv[2];
queryUserEvents(pubkey).catch(console.error); 