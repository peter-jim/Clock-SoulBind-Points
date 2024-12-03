const { SimplePool } = require('nostr-tools');
const WebSocket = require('ws');

// Provide global WebSocket implementation for nostr-tools
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = WebSocket;
}

class NostrClient {
  constructor(relayUrl) {
    this.relayUrl = relayUrl;
    this.pool = new SimplePool();
    this.subscriptions = new Map();
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;
    
    try {
      // Test connection by fetching a single event
      await this.pool.get(
        [this.relayUrl],
        { kinds: [1], limit: 1 }
      );
      this.connected = true;
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  async publish(event) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      console.log('Publishing event:', event.toJSON());
      const pubs = this.pool.publish([this.relayUrl], event.toJSON());
      await Promise.all(pubs);
      console.log('Event published successfully');
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  subscribe(filters, callback, onEose) {
    if (!this.connected) {
      throw new Error('Not connected to relay');
    }

    const subId = Math.random().toString(36).substring(2);
    const sub = this.pool.sub([this.relayUrl], filters);

    if (sub.on) {
      // Handle incoming events
      sub.on('event', (event) => {
        console.log('Received event:', event);
        callback(event);
      });

      // Handle end of stored events
      sub.on('eose', () => {
        console.log('End of stored events');
        if (onEose) onEose();
      });
    }

    this.subscriptions.set(subId, sub);
    return subId;
  }

  unsubscribe(subscriptionId) {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub?.unsub) {
      sub.unsub();
      this.subscriptions.delete(subscriptionId);
    }
  }

  close() {
    for (const [id, sub] of this.subscriptions.entries()) {
      if (sub?.unsub) {
        sub.unsub();
        this.subscriptions.delete(id);
      }
    }
    this.pool.close([this.relayUrl]);
    this.connected = false;
  }
}

module.exports = { NostrClient }; 