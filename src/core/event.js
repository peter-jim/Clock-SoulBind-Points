class BaseEvent {
  constructor(id, type, data) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      data: this.data,
      timestamp: this.timestamp
    };
  }
}

module.exports = { BaseEvent }; 