const { NostrClient } = require('../src/api/nostr/client');
const { NOSTR_KINDS } = require('../src/api/constants');

async function fetchHistory({ days = 30, limit = 100 } = {}) {
  console.log('Starting with options:', { days, limit });
  
  const client = new NostrClient('wss://relay1.nostrchat.io');

  try {
    console.log('Connecting to relay...');
    await client.connect();
    console.log('Connected to relay');

    console.log('Fetching historical invites...');
    const events = await historicalEvents(client, days, limit);
    console.log(`Found ${events.length} events`);
    
    return events;
  } finally {
    console.log('\nClosing connection...');
    client.close();
  }
}

function historicalEvents(client, days, limit) {
  return new Promise((resolve, reject) => {
    const events = [];
    const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);

    try {
      const subId = client.subscribe([
        {
          kinds: [NOSTR_KINDS.INVITE],
          since,
          limit
        }
      ], 
      (event) => {
        console.log('Received event:', event);
        events.push(event);
      },
      () => {
        console.log('End of stored events');
        resolve(events);
      });

      console.log('Subscription ID:', subId);
    } catch (error) {
      reject(error);
    }
  });
}

// Run if called directly
if (require.main === module) {
  fetchHistory().catch(console.error);
}

module.exports = { fetchHistory }; 