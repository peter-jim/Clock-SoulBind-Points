const { BaseEvent } = require('../core/event');
const { EVENT_TYPES } = require('../api/constants');
const { NostrInviteEvent } = require('../api/nostr/events');

class InviteEvent extends BaseEvent {
  constructor(id, inviter, invitee, metadata = {}) {
    super(id, EVENT_TYPES.INVITE);
    this.data = {
      inviter,
      invitee,
      metadata: {
        projectId: metadata.ProjectId,
        message: metadata.message,
        ...metadata
      }
    };
  }

  getProjectId() {
    return this.data.metadata.projectId || this.data.metadata.ProjectId;
  }

  async toNostrEvent() {
    return await NostrInviteEvent.create({
      inviter: this.data.inviter,
      invitee: this.data.invitee,
      projectId: this.getProjectId(),
      metadata: {
        message: this.data.metadata.message,
        timestamp: Date.now(),
        platform: 'CSBP',
        version: '1.0.0',
        ...this.data.metadata
      },
      privateKey: this.data.metadata.privateKey
    });
  }
}

module.exports = { InviteEvent }; 