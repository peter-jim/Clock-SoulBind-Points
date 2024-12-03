import { InviteEvent } from '../src/events/invite';

describe('InviteEvent', () => {
  test('should create invite event with correct structure', () => {
    const invite = new InviteEvent('test1', 'alice', 'bob', {
      ProjectId: 'project123',
      message: 'Join us!'
    });

    expect(invite.id).toBe('test1');
    expect(invite.type).toBe('INVITE');
    expect(invite.data.inviter).toBe('alice');
    expect(invite.data.invitee).toBe('bob');
    expect(invite.data.metadata.ProjectId).toBe('project123');
    expect(invite.data.metadata.message).toBe('Join us!');
  });
}); 