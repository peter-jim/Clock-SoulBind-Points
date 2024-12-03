const { CSBPClock, initializeClock } = require('../src/core/clock.js');
const { NostrClient, NostrInviteEvent, NOSTR_KINDS } = require('../src/api/index.js');
const { InviteEvent } = require('../src/events/invite.js');
const { generatePrivateKey } = require('../src/api/nostr/events.js');

async function main() {
  const client = new NostrClient('wss://relay1.nostrchat.io');
  
  try {
    // Initialize clock
    await initializeClock();
    const clock = new CSBPClock();
    
    // Connect to relay
    console.log('Connecting to relay...');
    await client.connect();
    console.log('Connected to relay');

    // Generate private key
    const privateKey = generatePrivateKey();
    console.log('Generated private key:', privateKey);

    // Create and send invite
    const invite = new InviteEvent('inv1', 'alice', 'bob', {
      ProjectId: 'ProjectId123',
      message: 'Join our group!'
    });
    
    // Add to clock
    clock.addEvent(invite);
    console.log('Added invite to clock:', invite);

    // Convert to Nostr event and publish
    const nostrInvite = await NostrInviteEvent.create({
      inviter: invite.data.inviter,
      invitee: invite.data.invitee,
      projectId: invite.data.metadata.ProjectId,
      metadata: {
        message: invite.data.metadata.message,
        timestamp: Date.now(),
        platform: 'CSBP',
        version: '1.0.0'
      },
      privateKey
    });

    // Create subscription completion promise
    const subscriptionComplete = new Promise((resolve) => {
      let eventCount = 0;
      const maxEvents = 5;

      // Subscribe to responses
      console.log('Subscribing to responses...');
      const subId = client.subscribe([
        {
          kinds: [NOSTR_KINDS.INVITE],
          authors: [nostrInvite.pubkey],
          since: Math.floor(Date.now() / 1000) - 60
        }
      ], (event) => {
        console.log('Received event:', event);
        eventCount++;
        if (eventCount >= maxEvents) {
          resolve();
        }
      }, () => {
        // EOSE callback
        console.log('End of stored events, completing subscription');
        resolve();
      });

      console.log('Subscription ID:', subId);
    });

    // Publish to relay
    console.log('Publishing invite to relay:', nostrInvite.toJSON());
    await client.publish(nostrInvite);
    console.log('Published invite to relay');

    // Wait for subscription completion or timeout
    await Promise.race([
      subscriptionComplete,
      new Promise(resolve => setTimeout(resolve, 10000))
    ]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Closing connection...');
    client.close();
  }
}

main().catch(console.error); 