const { CSBPClock, initializeClock } = require('../src/core/clock.js');
const { NostrClient } = require('../src/api/nostr/client.js');
const { InviteEvent } = require('../src/events/invite.js');
const { getPublicKey } = require('../src/api/nostr/events.js');
const { StorageManager } = require('../src/storage');
const { NOSTR_KINDS, EVENT_TYPES } = require('../src/api/constants');
const { validateContext } = require('../src/utils');

// 固定的私钥
const FIXED_PRIVATE_KEY = 'e8a904263dc87a7f52625dfa4f1e643d3531be5d5ded862eb1bc0ff6d1f2cd8f';

async function main() {
  const client = new NostrClient('wss://relay1.nostrchat.io');
  const storage = new StorageManager();
  
  try {
    // Optional: Clear database
    if (process.argv.includes('--clear-db')) {
      console.log('Clearing database...');
      await storage.clear();
      console.log('Database cleared');
    }

    await initializeClock();
    const clock = new CSBPClock(storage);
    
    // 使用固定私钥获取公钥
    const pubkey = await getPublicKey(FIXED_PRIVATE_KEY);
    console.log('Using fixed keypair:', {
      privateKey: FIXED_PRIVATE_KEY,
      pubkey
    });

    // Define context
    const context = {
      pubkey,
      projectId: 'ProjectId123',
      eventType: EVENT_TYPES.INVITE
    };

    // Initialize clock from storage for this context
    console.log('\nInitializing clock from storage...');
    const restoredEvents = await clock.initFromStorage(
      context.pubkey,
      context.projectId,
      context.eventType
    );
    console.log(`Restored ${restoredEvents} events`);
    clock.printClockState(context.pubkey, context.projectId, context.eventType);

    // Connect to relay
    console.log('\nConnecting to relay...');
    try {
      await client.connect();
      console.log('Connected to relay');
    } catch (error) {
      console.error('Failed to connect to relay:', error);
      throw error;
    }

    // Create invite event with fixed private key
    const invite = new InviteEvent('inv1', 'alice', 'bob', {
      ProjectId: context.projectId,
      message: 'Join our group!',
      privateKey: FIXED_PRIVATE_KEY
    });
    
    // Print state before publishing
    console.log('\nState before publishing:');
    const beforeEvents = await clock.getAllEvents(
      context.pubkey,
      context.projectId,
      context.eventType
    );
    console.log('Current events:', beforeEvents);
    clock.printClockState(context.pubkey, context.projectId, context.eventType);

    // Add event and publish to Nostr
    try {
      console.log('\nDatabase state before publishing:');
      await storage.printState();

      const newClockValue = await clock.addEventAfterNostrPublish(
        invite,
        client,
        context.pubkey,
        context.projectId,
        context.eventType
      );
      
      console.log('\nDatabase state after publishing:');
      await storage.printState();

      console.log('\nEvent published successfully with clock value:', newClockValue);
      clock.printClockState(context.pubkey, context.projectId, context.eventType);
    } catch (error) {
      console.error('Failed to publish event:', error);
      console.error('\nFinal database state:');
      await storage.printState();
      clock.printClockState(context.pubkey, context.projectId, context.eventType);
      throw error;
    }

    // Verify stored data
    const storedEvent = await clock.getEvent(
      invite.id,
      context.pubkey,
      context.projectId,
      context.eventType
    );
    console.log('\nVerifying stored data:');
    console.log('Event ID:', invite.id);
    console.log('Pubkey:', context.pubkey);
    console.log('Project ID:', context.projectId);
    console.log('Event Type:', context.eventType);
    console.log('Stored Event:', storedEvent);

    // 验证时钟值
    const clockValue = await storage.getLatestClockValue(
      context.pubkey,
      context.projectId,
      context.eventType
    );
    console.log('Latest clock value:', clockValue);

    // Subscribe to responses
    console.log('\nSubscribing to responses...');
    const subId = client.subscribe([
      {
        kinds: [NOSTR_KINDS.INVITE],
        authors: [pubkey],
        since: Math.floor(Date.now() / 1000) - 60
      }
    ], (event) => {
      console.log('Received event:', event);
    }, () => {
      console.log('End of stored events');
    });

    console.log('Subscription ID:', subId);

    // Wait for responses
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Print final state
    console.log('\nFinal clock state:');
    clock.printClockState(context.pubkey, context.projectId, context.eventType);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await storage.close();
    client.close();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, FIXED_PRIVATE_KEY }; 