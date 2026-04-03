/**
 * Secure Token Cache Service
 * Manages JWT tokens with expiry validation and safe storage
 */

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const USER_KEY = 'auth_user';
const STORAGE_TYPE = sessionStorage; // More secure than localStorage for tokens

class TokenCache {
  /**
   * Decode JWT payload without verification (for expiry check only)
   */
  decodeTokenPayload(token) {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    const payload = this.decodeTokenPayload(token);
    if (!payload || !payload.exp) return true;

    const expiryTime = payload.exp * 1000; // exp is in seconds, convert to ms
    const now = Date.now();
    return now >= expiryTime;
  }

  /**
   * Store token safely with expiry metadata
   */
  setToken(token, user) {
    if (!token) {
      this.clearAllTokens();
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.clearAllTokens();
      return false;
    }

    try {
      STORAGE_TYPE.setItem(TOKEN_KEY, token);
      STORAGE_TYPE.setItem(USER_KEY, JSON.stringify(user));

      // Get expiry from token payload
      const payload = this.decodeTokenPayload(token);
      if (payload?.exp) {
        STORAGE_TYPE.setItem(TOKEN_EXPIRY_KEY, payload.exp * 1000);
      }

      return true;
    } catch (error) {
      console.error('Failed to store token:', error);
      return false;
    }
  }

  /**
   * Get token with expiry check
   */
  getToken() {
    try {
      const token = STORAGE_TYPE.getItem(TOKEN_KEY);
      
      if (!token) return null;

      // Validate token is not expired
      if (this.isTokenExpired(token)) {
        this.clearAllTokens();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Get cached user data
   */
  getUser() {
    try {
      const user = STORAGE_TYPE.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      return null;
    }
  }

  /**
   * Get token expiry time in milliseconds
   */
  getTokenExpiry() {
    try {
      const expiry = STORAGE_TYPE.getItem(TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Failed to retrieve token expiry:', error);
      return null;
    }
  }

  /**
   * Get time until token expires in milliseconds
   */
  getTimeUntilExpiry() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return null;

    const timeLeft = expiry - Date.now();
    return timeLeft > 0 ? timeLeft : 0;
  }

  /**
   * Check if token exists and is valid
   */
  hasValidToken() {
    const token = STORAGE_TYPE.getItem(TOKEN_KEY);
    return token && !this.isTokenExpired(token);
  }

  /**
   * Clear all cached tokens and user data
   */
  clearAllTokens() {
    try {
      STORAGE_TYPE.removeItem(TOKEN_KEY);
      STORAGE_TYPE.removeItem(USER_KEY);
      STORAGE_TYPE.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Get cache status for debugging
   */
  getStatus() {
    const token = STORAGE_TYPE.getItem(TOKEN_KEY);
    const user = this.getUser();
    const expiry = this.getTokenExpiry();
    const timeLeft = this.getTimeUntilExpiry();

    return {
      hasToken: !!token,
      isExpired: token ? this.isTokenExpired(token) : null,
      user: user ? { id: user.id, email: user.email } : null,
      expiryTime: expiry ? new Date(expiry).toISOString() : null,
      timeUntilExpiry: timeLeft ? `${Math.floor(timeLeft / 1000)}s` : null
    };
  }
}

export default new TokenCache();
