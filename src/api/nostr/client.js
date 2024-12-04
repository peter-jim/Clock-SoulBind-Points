const WebSocket = require('ws');

class NostrClient {
  constructor(relayUrl) {
    this.relayUrl = relayUrl;
    this.ws = null;
    this.connected = false;
    this.messageHandlers = new Map();
    this.subscriptions = new Map();
  }

  async connect() {
    if (this.connected) return;
    
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to relay:', this.relayUrl);
        this.ws = new WebSocket(this.relayUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to', this.relayUrl);
          this.connected = true;
          this.setupMessageHandler();
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.connected = false;
          this.ws = null;
          this.messageHandlers.clear();
        };

      } catch (error) {
        console.error('Failed to connect:', error);
        reject(error);
      }
    });
  }

  setupMessageHandler() {
    this.ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        console.log('Received message:', data);
        
        if (data[0] === 'NOTICE') {
          console.error('Relay notice:', data[1]);
          if (data[1].toLowerCase().includes('invalid')) {
            for (const [eventId, handler] of this.messageHandlers) {
              handler(false, data[1]);
              this.messageHandlers.delete(eventId);
            }
          }
        } else if (data[0] === 'OK') {
          const [, eventId, success, message] = data;
          const handler = this.messageHandlers.get(eventId);
          if (handler) {
            handler(success, message);
            this.messageHandlers.delete(eventId);
          }
        } else if (data[0] === 'EVENT') {
          const [, subId, event] = data;
          const subscription = this.subscriptions.get(subId);
          if (subscription?.callback) {
            subscription.callback(event);
          }
        } else if (data[0] === 'EOSE') {
          const [, subId] = data;
          const subscription = this.subscriptions.get(subId);
          if (subscription?.onEose) {
            subscription.onEose();
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };
  }

  async publish(event) {
    if (!this.connected || !this.ws) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(event.id);
        reject(new Error('Publish timeout: no response from relay'));
      }, 15000);

      this.messageHandlers.set(event.id, (success, message) => {
        clearTimeout(timeout);
        if (success) {
          console.log('Event published successfully');
          resolve(event);
        } else {
          reject(new Error(`Relay rejected event: ${message}`));
        }
      });

      try {
        const eventData = ['EVENT', event];
        console.log('Sending event to relay:', JSON.stringify(eventData, null, 2));
        this.ws.send(JSON.stringify(eventData));
      } catch (error) {
        clearTimeout(timeout);
        this.messageHandlers.delete(event.id);
        reject(error);
      }
    });
  }

  async reconnect() {
    console.log('Attempting to reconnect...');
    this.close();
    await this.connect();
  }

  subscribe(filters, callback, onEose) {
    if (!this.connected || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    // Generate subscription ID
    const subId = Math.random().toString(36).substring(2);
    
    // Store subscription
    this.subscriptions.set(subId, {
      filters,
      callback,
      onEose
    });

    // Send subscription request
    try {
      const subRequest = ['REQ', subId, ...filters];
      console.log('Sending subscription request:', subRequest);
      this.ws.send(JSON.stringify(subRequest));
    } catch (error) {
      console.error('Error sending subscription:', error);
      this.subscriptions.delete(subId);
      throw error;
    }

    return subId;
  }

  unsubscribe(subId) {
    if (!this.connected || !this.ws) {
      return;
    }

    try {
      this.ws.send(JSON.stringify(['CLOSE', subId]));
      this.subscriptions.delete(subId);
      console.log('Unsubscribed from:', subId);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  }

  close() {
    // Unsubscribe from all subscriptions
    for (const subId of this.subscriptions.keys()) {
      this.unsubscribe(subId);
    }
    this.subscriptions.clear();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.messageHandlers.clear();
  }
}

module.exports = { NostrClient }; 