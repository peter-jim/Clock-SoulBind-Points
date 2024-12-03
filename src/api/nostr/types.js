const NostrTools = require('nostr-tools');

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