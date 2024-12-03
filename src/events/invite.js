const { BaseEvent } = require('../core/event');
const { EVENT_TYPES, RESPONSE_STATUS } = require('../api/constants');

class InviteEvent extends BaseEvent {
  constructor(id, inviter, invitee, metadata = {}) {
    super(id, EVENT_TYPES.INVITE);
    this.data = {
      inviter,
      invitee,
      status: RESPONSE_STATUS.PENDING,
      metadata: {
        projectId: metadata.ProjectId,
        message: metadata.message,
        ...metadata
      }
    };
  }

  accept() {
    this.data.status = RESPONSE_STATUS.ACCEPTED;
    this.data.responseTime = Date.now();
    console.log(`Invite ${this.id} accepted`);
  }

  reject() {
    this.data.status = RESPONSE_STATUS.REJECTED;
    this.data.responseTime = Date.now();
    console.log(`Invite ${this.id} rejected`);
  }
}

module.exports = { InviteEvent }; 