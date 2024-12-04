const { CSBPClock, initializeClock } = require('../src/core/clock');
const { InviteEvent } = require('../src/events/invite');
const { StorageManager } = require('../src/storage');
const { NostrClient } = require('../src/api/nostr/client');
const { generatePrivateKey } = require('../src/api/nostr/events');

jest.mock('../src/storage');
jest.mock('../src/api/nostr/client');

describe('CSBPClock', () => {
  let clock;
  let storage;
  let client;
  let privateKey;
  const testPubkey = 'testPubkey123';
  const testProjectId = 'testProject123';
  const testEventType = 'INVITE';

  beforeAll(async () => {
    await initializeClock();
  });

  beforeEach(() => {
    storage = new StorageManager();
    client = new NostrClient('wss://test.relay');
    clock = new CSBPClock(storage);
    privateKey = generatePrivateKey();
  });

  test('should add and retrieve events', async () => {
    const invite = new InviteEvent('event1', 'alice', 'bob', {
      ProjectId: testProjectId,
      message: 'Join us!',
      privateKey
    });

    const clockValue = await clock.addEventAfterNostrPublish(
      invite,
      client,
      testPubkey,
      testProjectId,
      testEventType
    );
    
    expect(clockValue).toBe(1);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Storage state before getEvent:');
    await storage.printState();
    
    const storedEvent = await clock.getEvent(
      'event1',
      testPubkey,
      testProjectId,
      testEventType
    );

    console.log('Retrieved event:', storedEvent);

    expect(storedEvent).toBeDefined();
    expect(storedEvent.event.id).toBe('event1');
    expect(storedEvent.clockValue).toBe(1);
  });

  test('should track multiple events', async () => {
    const invite1 = new InviteEvent('event1', 'alice', 'bob', {
      ProjectId: testProjectId,
      message: 'Join us!',
      privateKey
    });
    const invite2 = new InviteEvent('event2', 'bob', 'charlie', {
      ProjectId: testProjectId,
      message: 'Welcome!',
      privateKey
    });

    await clock.addEventAfterNostrPublish(
      invite1,
      client,
      testPubkey,
      testProjectId,
      testEventType
    );
    await clock.addEventAfterNostrPublish(
      invite2,
      client,
      testPubkey,
      testProjectId,
      testEventType
    );

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Storage state before getAllEvents:');
    await storage.printState();

    const events = await clock.getAllEvents(
      testPubkey,
      testProjectId,
      testEventType
    );

    console.log('Retrieved events:', events);

    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBe(2);
    expect(events[0].event.id).toBe('event1');
    expect(events[1].event.id).toBe('event2');
  });

  test('should maintain clock order', async () => {
    const invite1 = new InviteEvent('event1', 'alice', 'bob', {
      ProjectId: testProjectId,
      message: 'First invite',
      privateKey
    });
    const invite2 = new InviteEvent('event2', 'bob', 'charlie', {
      ProjectId: testProjectId,
      message: 'Second invite',
      privateKey
    });

    const value1 = await clock.addEventAfterNostrPublish(
      invite1,
      client,
      testPubkey,
      testProjectId,
      testEventType
    );
    const value2 = await clock.addEventAfterNostrPublish(
      invite2,
      client,
      testPubkey,
      testProjectId,
      testEventType
    );

    expect(value2).toBeGreaterThan(value1);
  });
}); 