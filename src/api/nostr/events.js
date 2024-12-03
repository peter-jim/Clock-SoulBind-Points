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

// Derive public key from private key
async function getPublicKey(privateKey) {
  const cleanKey = privateKey.replace('0x', '');
  const privateKeyBytes = Uint8Array.from(Buffer.from(cleanKey, 'hex'));
  const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes);
  return Buffer.from(publicKeyBytes.slice(1, 33)).toString('hex');
}

// Convert hex string to byte array
function hexToBytes(hex) {
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

// Convert byte array to hex string
function bytesToHex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

// Calculate event hash
function getEventHash(event) {
  const serialized = JSON.stringify([
    0,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags,
    event.content
  ]);
  
  const hash = crypto.createHash('sha256')
    .update(Buffer.from(serialized))
    .digest();
  
  return bytesToHex(hash);
}

// Sign event with private key
async function signEvent(event, privateKey) {
  const hash = getEventHash(event);
  const privateKeyBytes = hexToBytes(privateKey);
  
  // Ensure hash is 32 bytes before signing
  const hashBytes = hexToBytes(hash);
  if (hashBytes.length !== 32) {
    throw new Error('Invalid hash length');
  }
  
  // Sign using schnorr signature
  const signatureBytes = await secp256k1.schnorr.sign(hashBytes, privateKeyBytes);
  return bytesToHex(signatureBytes);
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
      const sk = privateKey || generatePrivateKey();
      const pk = await getPublicKey(sk);

      const contentData = {
        inviter,
        invitee,
        projectId,
        metadata,
        type: 'invite'
      };

      const eventData = {
        pubkey: pk,
        created_at: Math.floor(Date.now() / 1000),
        kind: NOSTR_KINDS.INVITE,
        tags: [
          ['t', 'invite'],
          ['p', invitee]
        ],
        content: JSON.stringify(contentData)
      };

      const id = getEventHash(eventData);
      const sig = await signEvent(eventData, sk);

      const event = {
        id,
        ...eventData,
        sig
      };

      console.log('Created event:', event);

      const nostrEvent = new NostrInviteEvent(event);
      nostrEvent.privateKey = sk;
      return nostrEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static fromNostrEvent(event) {
    try {
      const content = JSON.parse(event.content);
      return new NostrInviteEvent({
        ...event,
        content
      });
    } catch (error) {
      console.error('Error parsing event content:', error);
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

module.exports = { NostrInviteEvent, generatePrivateKey };