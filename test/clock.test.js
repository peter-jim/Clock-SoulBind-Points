const { CSBPClock, initializeClock } = require('../src/core/clock');
const { InviteEvent } = require('../src/events/invite');

describe('CSBPClock', () => {
  let clock;

  beforeAll(async () => {
    await initializeClock();
  });

  beforeEach(() => {
    clock = new CSBPClock();
  });

  test('should add and retrieve events', () => {
    const invite = new InviteEvent('event1', 'alice', 'bob');
    const count = clock.addEvent(invite);
    
    expect(count).toBe(1);
    expect(clock.getEvent('event1')).toBe(invite);
  });

  test('should track multiple events', () => {
    const invite = new InviteEvent('event1', 'alice', 'bob');
    
    clock.addEvent(invite);
    
    const events = clock.getAllEvents();
    expect(events).toHaveLength(1);
  });
}); 