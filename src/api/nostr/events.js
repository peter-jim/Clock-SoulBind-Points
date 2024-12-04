const { NostrEvent } = require('./types');
const { NOSTR_KINDS } = require('../constants');
const secp256k1 = require('@noble/secp256k1');
const crypto = require('crypto');

// Set sha256 hash function for secp256k1
secp256k1.utils.sha256 = (...messages) => {
  const hash = crypto.createHash('sha256');
  messages.forEach(m => hash.update(m));
  return Uint8Array.from(hash.digest());
};

// Generate a new private key
function generatePrivateKey() {
  return Buffer.from(crypto.randomBytes(32)).toString('hex');
}

// Get public key from private key
async function getPublicKey(privateKey) {
  try {
    const cleanKey = privateKey.replace('0x', '');
    const privateKeyBytes = Uint8Array.from(Buffer.from(cleanKey, 'hex'));
    const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes, true);
    return Buffer.from(publicKeyBytes.slice(1)).toString('hex');
  } catch (error) {
    console.error('Error generating public key:', error);
    throw error;
  }
}

class NostrInviteEvent extends NostrEvent {
  static async create({
    inviter,
    invitee,
    projectId,
    metadata,
    privateKey
  }) {
    try {
      const pubkey = await getPublicKey(privateKey);
      console.log('Generated pubkey:', pubkey);

      const contentData = {
        inviter,
        invitee,
        projectId,
        metadata: {
          ...metadata,
          timestamp: Date.now()
        },
        type: 'invite'
      };

      const eventData = {
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        kind: NOSTR_KINDS.INVITE,
        tags: [
          ['t', 'invite'],
          ['p', invitee],
          ['project', projectId]
        ],
        content: JSON.stringify(contentData)
      };

      // Create and sign event
      const event = await NostrEvent.signEvent(eventData, privateKey);
      return new NostrInviteEvent(event);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  getInviteData() {
    try {
      return JSON.parse(this.content);
    } catch {
      return null;
    }
  }
}

module.exports = {
  NostrInviteEvent,
  generatePrivateKey,
  getPublicKey
};