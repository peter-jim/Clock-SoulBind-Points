# Clock-SoulBind-Points

A decentralized invitation system based on Verifiable Logical Clock and Nostr protocol.

## Features

- Verifiable Logical Clock implementation
- Nostr protocol integration
- Invite event management
- Decentralized event verification
- Multiple relay support

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Clock-SoulBind-Points.git

# Install dependencies
cd Clock-SoulBind-Points
npm install
```

## Usage

### Basic Usage

```javascript
const { CSBPClock, InviteEvent } = require('csbp');

// Initialize clock
await initializeClock();
const clock = new CSBPClock();

// Create an invite event
const invite = new InviteEvent('eventId', 'alice', 'bob', {
  ProjectId: 'project123',
  message: 'Join our project!'
});

// Add event to clock
clock.addEvent(invite);

// Handle invite response
invite.accept(); // or invite.reject()
```

### Nostr Integration

```javascript
const { NostrClient, NostrInviteEvent } = require('csbp');

// Create Nostr client
const client = new NostrClient('wss://relay1.nostrchat.io');

// Connect to relay
await client.connect();

// Create and publish invite
const invite = await NostrInviteEvent.create({
  inviter: 'alice',
  invitee: 'bob',
  projectId: 'project123',
  metadata: {
    message: 'Join us!',
    platform: 'CSBP'
  }
});

// Publish to relay
await client.publish(invite);

// Subscribe to responses
client.subscribe([
  {
    kinds: [1111], // INVITE kind
    authors: [invite.pubkey]
  }
], (event) => {
  console.log('Received:', event);
});
```

### Command Line Tools

```bash
# Fetch historical invites
npm run fetch-history

# Fetch specific event
npm run fetch-event <eventId>
```

## API Reference

### CSBPClock

Core clock implementation for event ordering.

- `addEvent(event)`: Add new event
- `getEvent(id)`: Get event by ID
- `getAllEvents()`: Get all events

### NostrClient

Nostr protocol client implementation.

- `connect()`: Connect to relay
- `publish(event)`: Publish event
- `subscribe(filters, callback)`: Subscribe to events
- `close()`: Close connection

### Events

#### InviteEvent

Base invite event implementation.

- `accept()`: Accept invitation
- `reject()`: Reject invitation
- `getStatus()`: Get current status

#### NostrInviteEvent

Nostr-specific invite event implementation.

- `create(options)`: Create new event
- `fromNostrEvent(event)`: Convert from Nostr event
- `getInviteData()`: Get invite metadata

## Development

```bash
# Run tests
npm test

# Run specific test
npm test test/nostr/client.test.js

# Run examples
npm run example
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.