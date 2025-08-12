/**
 * @typedef {'text' | 'system' | 'answer' | 'question' | 'result'} MessageType
 */

/**
 * @typedef {Object} Sender
 * @property {string} id
 * @property {string} name
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} Reactions
 * @property {string[]} [key] - Array of userIds who reacted with this emoji
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {MessageType} type
 * @property {string} content
 * @property {Sender} sender
 * @property {number} timestamp
 * @property {string} roomId
 * @property {string} [replyTo]
 * @property {Reactions} [reactions]
 */

// Có thể export một message factory để tạo message mới
export const createChatMessage = ({
  id,
  type = 'text',
  content,
  sender,
  roomId,
  replyTo = null
}) => ({
  id,
  type,
  content,
  sender,
  timestamp: Date.now(),
  roomId,
  replyTo,
  reactions: {}
});