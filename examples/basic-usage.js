const { CSBPClock, initializeClock } = require('../src/core/clock.js');
const { InviteEvent } = require('../src/events/invite.js');
const { NostrClient } = require('../src/api/nostr/client.js');

async function main() {
  // Initialize clock and Nostr client
  await initializeClock();
  const clock = new CSBPClock();
  const client = new NostrClient('wss://relay1.nostrchat.io');// wss://relay1.nostrchat.io


  try {
    // Connect to Nostr relay
    await client.connect();
    console.log('Connected to Nostr relay');

    // Create invite event
    const invite = new InviteEvent('eventId', 'alice', 'bob', {
      ProjectId: 'project123',
      message: 'Join our project!',
      platform: 'CSBP',
      version: '1.0.0'
    });

    // Add event only after successful Nostr publish
    await clock.addEventAfterNostrPublish(invite, client);
    console.log('Created and published invite:', invite);

    // Accept invite
    invite.accept();

    // Get all events
    console.log('All events:', clock.getAllEvents());
  } catch (error) {
    console.error('Failed to create invite:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error); 