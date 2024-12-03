const { InviteEvent } = require('../../src/events/invite');
const { RESPONSE_STATUS } = require('../../src/api/constants');

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

  test('should handle accept/reject', () => {
    const invite = new InviteEvent('inv1', 'alice', 'bob');
    
    invite.accept();
    expect(invite.data.status).toBe(RESPONSE_STATUS.ACCEPTED);
    expect(invite.data.responseTime).toBeDefined();

    invite.reject();
    expect(invite.data.status).toBe(RESPONSE_STATUS.REJECTED);
    expect(invite.data.responseTime).toBeDefined();
  });
}); 