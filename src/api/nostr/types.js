const secp256k1 = require('@noble/secp256k1');
const crypto = require('crypto');

// Base class for Nostr events
class NostrEvent {
  constructor({
    id,
    pubkey,
    created_at,
    kind,
    tags,
    content,
    sig
  }) {
    this.id = id;
    this.pubkey = pubkey;
    this.created_at = created_at;
    this.kind = kind;
    this.tags = tags;
    this.content = content;
    this.sig = sig;
  }

  // Calculate event hash
  static getEventHash(event) {
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
    
    return Buffer.from(hash).toString('hex');
  }

  // Sign event with private key
  static async signEvent(eventData, privateKey) {
    const id = this.getEventHash(eventData);
    const cleanKey = privateKey.replace('0x', '');
    const privateKeyBytes = Uint8Array.from(Buffer.from(cleanKey, 'hex'));
    const hashBytes = Uint8Array.from(Buffer.from(id, 'hex'));

    const sig = await secp256k1.schnorr.sign(hashBytes, privateKeyBytes);
    const sigHex = Buffer.from(sig).toString('hex');

    return {
      id,
      ...eventData,
      sig: sigHex
    };
  }

  // Convert event to JSON format
  toJSON() {
    return {
      id: this.id,
      pubkey: this.pubkey,
      created_at: this.created_at,
      kind: this.kind,
      tags: this.tags,
      content: this.content,
      sig: this.sig
    };
  }
}

module.exports = { NostrEvent }; 