/**
 * Generate atau ambil session ID dari sessionStorage.
 * Session ID dipakai untuk tracking history per sesi browser.
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('glappy_session');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('glappy_session', sessionId);
  }
  return sessionId;
};
