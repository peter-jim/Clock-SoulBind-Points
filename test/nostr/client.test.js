// 添加全局 TextDecoder
global.TextDecoder = require('util').TextDecoder;
global.TextEncoder = require('util').TextEncoder;

const { NostrClient } = require('../../src/api/nostr/client');
const { NostrInviteEvent } = require('../../src/api/nostr/events');
const { generatePrivateKey } = require('../../src/api/nostr/events');

describe('NostrClient', () => {
  let client;
  let privateKey;

  beforeEach(() => {
    client = new NostrClient('wss://relay.example.com');
    privateKey = generatePrivateKey();
  });

  test('should create invite event with correct format', async () => {
    const invite = await NostrInviteEvent.create({
      inviter: 'alice',
      invitee: 'bob',
      projectId: 'project123',
      metadata: {
        message: 'Join us!',
        timestamp: Date.now(),
        platform: 'CSBP'
      },
      privateKey
    });

    const data = invite.getInviteData();
    expect(data.type).toBe('invite');
    expect(data.inviter).toBe('alice');
    expect(data.invitee).toBe('bob');
    expect(data.projectId).toBe('project123');
    expect(data.metadata.message).toBe('Join us!');

    // 验证标签
    const pTag = invite.tags.find(t => t[0] === 'p');
    expect(pTag[1]).toBe('bob');
    const tTag = invite.tags.find(t => t[0] === 't');
    expect(tTag[1]).toBe('invite');
  });
}); 