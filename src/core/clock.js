let Clock;

// 使用动态导入
async function initializeClock() {
  const vlc = await import('verifiable-logical-clock');
  Clock = vlc.Clock;
}

class CSBPClock {
  constructor() {
    if (!Clock) {
      throw new Error('Clock not initialized. Please call initializeClock() first.');
    }
    this.clock = new Clock();
    this.events = new Map();
  }

  addEvent(event) {
    this.clock.inc(event.id);
    this.events.set(event.id, event);
    return this.clock.get(event.id);
  }

  getEvent(id) {
   
    return this.events.get(id);
  }

  getAllEvents() {
    return Array.from(this.events.values());
  }
}

module.exports = { CSBPClock, initializeClock }; 