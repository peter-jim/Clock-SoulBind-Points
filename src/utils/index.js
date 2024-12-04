// Generate unique event ID
function generateEventId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format timestamp
function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString();
}

// Validate context
function validateContext(context) {
  const { pubkey, projectId, eventType } = context;
  if (!pubkey || !projectId || !eventType) {
    throw new Error('Invalid context: missing required fields');
  }
  return true;
}

module.exports = {
  generateEventId,
  formatTimestamp,
  validateContext
}; 