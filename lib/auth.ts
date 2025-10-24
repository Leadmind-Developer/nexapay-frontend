export const TOKEN_KEY = "nexa_token";

export function saveToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
