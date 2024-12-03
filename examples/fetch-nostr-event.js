const { NostrClient, NOSTR_KINDS } = require('../src/api/index.js');

async function fetchEventById(eventId, relayUrl) {
  const client = new NostrClient(relayUrl);
  
  try {
    // 连接到 relay
    console.log('Connecting to relay:', relayUrl);
    await client.connect();
    console.log('Connected to relay');

    // 获取指定事件
    console.log(`\nFetching event with ID: ${eventId}`);
    console.log('Query parameters:');
    const queryParams = {
      kinds: [NOSTR_KINDS.INVITE], // 指定事件类型
      ids: [eventId],
      limit: 1
    };
    console.log(JSON.stringify(queryParams, null, 2));

    const event = await new Promise((resolve) => {
      let foundEvent = null;
      const timeout = setTimeout(() => {
        if (!foundEvent) {
          console.log('Query timed out after 10 seconds');
          resolve(null);
        }
      }, 10000);

      client.subscribe([queryParams], (event) => {
        console.log('Received event:', event);
        foundEvent = event;
        clearTimeout(timeout);
        resolve(event);
      }, () => {
        console.log('End of stored events');
        setTimeout(() => {
          if (!foundEvent) {
            console.log('No event found after EOSE');
            resolve(null);
          }
        }, 2000);
      });
    });

    // 打印事件详情
    if (event) {
      console.log('\nEvent details:');
      console.log('-------------------------------------------');
      console.log('ID:', event.id);
      console.log('Author:', event.pubkey);
      console.log('Created:', new Date(event.created_at * 1000).toISOString());
      console.log('Kind:', event.kind);
      
      try {
        const content = JSON.parse(event.content);
        console.log('Content:', JSON.stringify(content, null, 2));
      } catch {
        console.log('Content:', event.content);
      }
      
      console.log('\nTags:');
      event.tags.forEach(tag => {
        console.log(`  - ${tag[0]}: ${tag.slice(1).join(', ')}`);
      });
    } else {
      console.log('\nEvent not found');
      console.log('This might be because:');
      console.log('1. The event ID does not exist');
      console.log('2. The relay does not have this event');
      console.log('3. The event has been deleted or expired');
      console.log('4. Connection issues with the relay');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('\nClosing connection...');
    client.close();
  }
}

// 获取命令行参数
const eventId = process.argv[2];
const relayUrl = process.argv[3] || 'wss://relay1.nostrchat.io';

if (!eventId) {
  console.error('Please provide an event ID');
  console.error('Usage: node fetch-nostr-event.js <eventId> [relayUrl]');
  process.exit(1);
}

console.log('Starting with options:', { eventId, relayUrl });
fetchEventById(eventId, relayUrl).catch(console.error); 