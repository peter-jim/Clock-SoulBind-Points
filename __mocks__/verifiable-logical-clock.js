class Clock {
  constructor() {
    this.values = new Map();
  }

  inc(id) {
    const value = this.values.get(id) || 0;
    this.values.set(id, value + 1);
    return value + 1;
  }

  get(id) {
    return this.values.get(id) || 0;
  }
}

module.exports = { Clock }; 