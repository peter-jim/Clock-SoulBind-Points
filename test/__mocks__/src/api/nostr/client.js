class NostrClient {
  constructor() {
    this.connected = false;
  }

  async connect() {
    this.connected = true;
  }

  async publish(event) {
    return event;
  }

  close() {
    this.connected = false;
  }
}

module.exports = { NostrClient }; 