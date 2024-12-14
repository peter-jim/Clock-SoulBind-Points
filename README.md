# causality-client-js

JavaScript client library for Causality Protocol - A decentralized invitation system based on Verifiable Logical Clock and Nostr protocol.

## Features

- Verifiable Logical Clock implementation
- Nostr protocol integration
- Local event storage and synchronization
- Multi-project and event type support
- Reliable clock synchronization
- Invitation tree visualization
- Causal relationship tracking

## Installation

```bash
npm install causality-client-js
```

## Usage

```javascript
const { APIClient } = require('causality-client-js');

const client = new APIClient({
  baseURL: 'http://18.136.124.172:3200'
});

// Get direct invites
const directInvites = await client.getDirectInvites(address, projectId);

// Get indirect invites
const indirectInvites = await client.getIndirectInvites(address, projectId);

// Get total invites
const totalInvites = await client.getTotalInvites(address, projectId);

// Get incentives
const incentives = await client.getIncentives(address, projectId);
```

## Examples

### Basic Usage

```javascript
const { CSBPClock, initializeClock } = require('./src/core/clock');
const { StorageManager } = require('./src/storage');
const { NostrClient } = require('./src/api/nostr/client');
const { InviteEvent } = require('./src/events/invite');
const { generatePrivateKey } = require('./src/api/nostr/events');

async function main() {
  // Initialize
  await initializeClock();
  const storage = new StorageManager();
  const clock = new CSBPClock(storage);
  const client = new NostrClient('wss://relay.nostr.com');
  
  // Generate keys
  const privateKey = generatePrivateKey();
  
  // Create invite event
  const invite = new InviteEvent('event1', 'alice', 'bob', {
    projectId: 'project123',
    message: 'Join our project!',
    privateKey,
    clock // Pass clock instance to track causal relationships
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
}
```

### Fetch Nostr Event

```javascript
const { NostrClient } = require('./src/api/nostr/client');

// Fetch specific event by ID
const client = new NostrClient('wss://relay.nostr.com');
await client.connect();

client.subscribe([{
  kinds: [1111], // INVITE event kind
  ids: ['event_id']
}], (event) => {
  console.log('Received event:', event);
});
```

### Query Invitation Status

```javascript
const { APIClient } = require('./src/api/client');

const client = new APIClient();
const address = '0x123...';
const projectId = 'project123';

// Get direct invites
const directInvites = await client.getDirectInvites(address, projectId);

// Get indirect invites
const indirectInvites = await client.getIndirectInvites(address, projectId);

// Get invitation tree
const tree = await client.getInviteTree(address, projectId);
```

## API Reference

### CSBPClock

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

### InviteEvent

```javascript
class InviteEvent {
  constructor(id, inviter, invitee, metadata = {})
  getProjectId()
  async toNostrEvent()
}
```

### APIClient

```javascript
class APIClient {
  async getDirectInvites(address, projectId)
  async getIndirectInvites(address, projectId)
  async getTotalInvites(address, projectId)
  async getIncentives(address, projectId)
  async getInviteTree(address, projectId)
  async getInvitePath(fromAddress, toAddress, projectId)
}
```

## Development

```bash
# Run tests
npm test

# Run specific test
npm test test/clock.test.js

# Run example
node examples/nostr-usage.js

# Fetch specific Nostr event
node examples/fetch-nostr-event.js <eventId> [relayUrl]
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
- Each event includes a clock value for causal relationship tracking

## License

MIT