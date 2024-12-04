class BaseEvent {
  constructor(id, type, data) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
    this.clockValue = null;
    this.nostrId = null;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      data: this.data,
      timestamp: this.timestamp,
      clockValue: this.clockValue,
      nostrId: this.nostrId
    };
  }

  setClockValue(value) {
    this.clockValue = value;
    return this;
  }

  setNostrId(id) {
    this.nostrId = id;
    return this;
  }
}

module.exports = { BaseEvent }; 