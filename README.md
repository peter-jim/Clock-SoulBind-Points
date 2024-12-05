# Clock-SoulBind-Points

A decentralized invitation system based on Verifiable Logical Clock and Nostr protocol.

## Features

- Verifiable Logical Clock implementation
- Nostr protocol integration
- Local event storage and synchronization
- Multi-project and event type support
- Reliable clock synchronization

## Installation

```bash
# Clone the repository
git clone https://github.com/peter-jim/Clock-SoulBind-Points

# Install dependencies
cd Clock-SoulBind-Points
npm install
```

## Usage

### Basic Usage

```javascript
const { CSBPClock, initializeClock } = require('./src/core/clock');
const { StorageManager } = require('./src/storage');
const { NostrClient } = require('./src/api/nostr/client');
const { InviteEvent } = require('./src/events/invite');

// Initialize
await initializeClock();
const storage = new StorageManager();
const clock = new CSBPClock(storage);
const client = new NostrClient('wss://relay.nostr.com');

// Create an invite event
const invite = new InviteEvent('event1', 'alice', 'bob', {
  ProjectId: 'project123',
  message: 'Join our project!',
  privateKey: 'your_private_key'
});

// Publish event and update clock
const clockValue = await clock.addEventAfterNostrPublish(
  invite,
  client,
  'pubkey123',
  'project123',
  'INVITE'
);

// Query events
const events = await clock.getAllEvents('pubkey123', 'project123', 'INVITE');
```

### Event Types

Currently supported event types:
- INVITE: Invitation events

## API Reference

### CSBPClock

Main clock synchronization class.

```javascript
class CSBPClock {
  constructor(storage)
  async addEventAfterNostrPublish(event, nostrClient, pubkey, projectId, eventType)
  async getEvent(eventId, pubkey, projectId, eventType)
  async getAllEvents(pubkey, projectId, eventType)
  getClockValue(pubkey, projectId, eventType)
  getClockState(pubkey, projectId, eventType)
}
```

### StorageManager

Local storage manager.

```javascript
class StorageManager {
  async storeEvent(event, clockValue, pubkey, projectId, eventType)
  async getEvent(eventId, pubkey, projectId, eventType)
  async getAllEvents(pubkey, projectId, eventType)
  async getLatestClockValue(pubkey, projectId, eventType)
}
```

### InviteEvent

Invitation event class.

```javascript
class InviteEvent {
  constructor(id, inviter, invitee, metadata = {})
  getProjectId()
  async toNostrEvent()
}
```

### NostrClient

Nostr protocol client implementation.

```javascript
class NostrClient {
  constructor(relayUrl)
  async connect()
  async publish(event)
  subscribe(filters, onEvent, onEose)
  close()
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run specific test
npm test test/clock.test.js

# Run example
npm run example
```

## Project Structure

```
src/
  ├── api/          # API related code
  │   └── nostr/    # Nostr protocol implementation
  ├── core/         # Core logic
  ├── events/       # Event definitions
  ├── storage/      # Storage implementation
  └── utils/        # Utility functions
test/               # Test files
examples/           # Example code
```

## Important Notes

- Call `initializeClock()` before using CSBPClock
- Local storage uses LevelDB, data is stored in `.clockdb` directory
- Keep private keys secure, do not commit them to the repository
- Events are synchronized through Nostr relays
- Each event requires a valid private key for signing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.