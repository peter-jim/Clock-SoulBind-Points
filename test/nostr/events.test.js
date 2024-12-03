// 添加全局 TextDecoder
global.TextDecoder = require('util').TextDecoder;
global.TextEncoder = require('util').TextEncoder;

const { NostrInviteEvent, generatePrivateKey } = require('../../src/api/nostr/events');

describe('NostrInviteEvent', () => {
  let privateKey;

  beforeEach(() => {
    privateKey = generatePrivateKey();
  });

  test('should create and validate event', async () => {
    const invite = await NostrInviteEvent.create({
      inviter: 'alice',
      invitee: 'bob',
      projectId: 'project123',
      metadata: {
        message: 'Join us!'
      },
      privateKey
    });

    expect(invite.id).toBeDefined();
    expect(invite.pubkey).toBeDefined();
    expect(invite.sig).toBeDefined();

    const data = invite.getInviteData();
    expect(data.inviter).toBe('alice');
    expect(data.invitee).toBe('bob');
  });
}); 