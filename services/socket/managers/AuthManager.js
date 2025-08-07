import { tokenService } from "../../auth/tokenService.js";

export class AuthManager {
  constructor() {}

  /**
   * Validate user authentication
   */
  validateAuth(socket) {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return false;
    }
    return true;
  }

  /**
   * Validate host permissions
   */
  validateHost(socket) {
    if (!socket.isHost) {
      socket.emit('error', { message: 'Only host can perform this action' });
      return false;
    }
    return true;
  }

  /**
   * Handle authentication event
   */
  async handleAuthenticate(socket, data) {
    try {
      const { token } = data;
      const decoded = tokenService.verifyToken(token);
      
      socket.userId = decoded.id;
      socket.authenticated = true;
      
      socket.emit('authenticated', {
        success: true,
        message: 'Authenticated successfully'
      });
      
      return true;
    } catch (error) {
      socket.emit('auth_error', {
        success: false,
        message: 'Invalid token'
      });
      return false;
    }
  }

  /**
   * Handle socket errors consistently
   */
  handleError(socket, error, context = '') {
    console.error(`Error in ${context}:`, error);
    socket.emit('error', { 
      message: error.message || 'An error occurred',
      context: context
    });
  }
}