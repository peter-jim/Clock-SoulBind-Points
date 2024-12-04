const { StorageManager } = require('../src/storage');
const { formatTimestamp } = require('../src/utils');

async function queryEvent() {
  const storage = new StorageManager();

  try {
    console.log('\n=== Event Query Tool ===\n');

    const args = process.argv.slice(2);
    const [queryType, queryValue] = args;

    if (!queryType || !queryValue) {
      console.log('Usage: node query-event.js <queryType> <value>');
      console.log('\nQuery Types:');
      console.log('  id        - Query by event ID');
      console.log('  nostr     - Query by Nostr ID');
      console.log('  clock     - Query by clock value');
      console.log('  project   - Query by project ID');
      console.log('\nExamples:');
      console.log('  node query-event.js id event123');
      console.log('  node query-event.js nostr abc123def456');
      console.log('  node query-event.js clock 42');
      return;
    }

    let record;
    switch (queryType) {
      case 'nostr':
        record = await storage.getEventByNostrId(queryValue);
        console.log('\nQuerying by Nostr ID:', queryValue);
        break;

      case 'clock':
        const [pubkey, projectId, eventType] = queryValue.split(':');
        if (!pubkey || !projectId || !eventType) {
          throw new Error('Clock query requires pubkey:projectId:eventType:value format');
        }
        const clockValue = queryValue.split(':')[3];
        record = await storage.getEventByClockValue(clockValue, pubkey, projectId, eventType);
        console.log('\nQuerying by Clock Value:', clockValue);
        break;

      case 'id':
        const [eventPubkey, eventProjectId, eventType2, eventId] = queryValue.split(':');
        if (!eventPubkey || !eventProjectId || !eventType2 || !eventId) {
          throw new Error('Event ID query requires pubkey:projectId:eventType:eventId format');
        }
        record = await storage.getEvent(eventId, eventPubkey, eventProjectId, eventType2);
        console.log('\nQuerying by Event ID:', eventId);
        break;

      default:
        throw new Error(`Unknown query type: ${queryType}`);
    }

    if (record) {
      console.log('\nFound Event:');
      console.log('-------------------------------------------');
      console.log('ID:', record.event.id);
      console.log('Clock Value:', record.clockValue);
      console.log('Nostr ID:', record.nostrId);
      console.log('Project ID:', record.projectId);
      console.log('Event Type:', record.eventType);
      console.log('Timestamp:', formatTimestamp(record.timestamp));
      console.log('\nEvent Details:');
      console.log(JSON.stringify(record.event.data, null, 2));
    } else {
      console.log('\nNo event found');
    }

  } catch (error) {
    console.error('Error querying event:', error);
  } finally {
    await storage.close();
  }
}

queryEvent().catch(console.error); 