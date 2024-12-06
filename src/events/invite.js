const { NostrInviteEvent } = require('../api/nostr/events');
const { EVENT_TYPES } = require('../api/constants');

class InviteEvent {
  constructor(id, inviter, invitee, metadata = {}) {
    this.id = id;
    this.type = EVENT_TYPES.INVITE;
    this.data = {
      inviter,
      invitee,
      projectId: metadata.ProjectId || metadata.projectId,
      metadata: {
        message: metadata.message || '',
        timestamp: Date.now(),
        platform: 'CSBP',
        version: '1.0.0'
      }
    };
    
    // Store private key separately, not in the data object
    this._privateKey = metadata.privateKey;
    // Store clock instance if provided
    this._clock = metadata.clock;
  }

  getProjectId() {
    return this.data.projectId;
  }

  async toNostrEvent() {
    if (!this._privateKey) {
      throw new Error('Private key is required to create Nostr event');
    }

    // Get current clock value if clock instance is available
    let clockValue = 0;
    if (this._clock) {
      clockValue = this._clock.getClockValue(
        this.data.inviter, // using inviter as pubkey
        this.data.projectId,
        this.type
      );
    }

    return NostrInviteEvent.create({
      id: this.id,
      inviter: this.data.inviter,
      invitee: this.data.invitee,
      projectId: this.data.projectId,
      metadata: {
        message: this.data.metadata.message,
        timestamp: this.data.metadata.timestamp,
        platform: this.data.metadata.platform,
        version: this.data.metadata.version,
        clock: clockValue // Add clock value to metadata
      },
      privateKey: this._privateKey
    });
  }
}

module.exports = { InviteEvent }; 