const { InviteEvent } = require('../../src/events/invite');
const { generatePrivateKey } = require('../../src/api/nostr/events');

describe('InviteEvent', () => {
  test('should create invite event with correct data', () => {
    const invite = new InviteEvent('inv1', 'alice', 'bob', {
      ProjectId: 'project123',
      message: 'Join us!'
    });

    expect(invite.id).toBe('inv1');
    expect(invite.data.inviter).toBe('alice');
    expect(invite.data.invitee).toBe('bob');
    expect(invite.data.metadata.projectId).toBe('project123');
    expect(invite.data.metadata.message).toBe('Join us!');
  });

  test('should get project ID correctly', () => {
    const invite1 = new InviteEvent('inv1', 'alice', 'bob', {
      ProjectId: 'project123'
    });
    expect(invite1.getProjectId()).toBe('project123');

    const invite2 = new InviteEvent('inv2', 'alice', 'bob', {
      projectId: 'project456'
    });
    expect(invite2.getProjectId()).toBe('project456');
  });

  test('should convert to Nostr event', async () => {
    const privateKey = generatePrivateKey();
    const invite = new InviteEvent('inv1', 'alice', 'bob', {
      ProjectId: 'project123',
      message: 'Join us!',
      privateKey
    });

    const nostrEvent = await invite.toNostrEvent();
    expect(nostrEvent).toBeDefined();
    expect(nostrEvent.kind).toBe(1111); // NOSTR_KINDS.INVITE
    
    const content = JSON.parse(nostrEvent.content);
    expect(content.inviter).toBe('alice');
    expect(content.invitee).toBe('bob');
    expect(content.projectId).toBe('project123');
  });
}); 