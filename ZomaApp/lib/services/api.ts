'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'zoma_token';

// ─── token helpers ─────────────────────────────────────────────────────────
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function storeToken(t: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

// ─── requête HTTP centrale ─────────────────────────────────────────────────
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch (e: any) {
    throw new Error('Impossible de joindre le serveur: ' + (e.message ?? e));
  }

  if (response.status === 401 || response.status === 403) {
    clearToken();
    throw new Error('Session expirée — veuillez vous reconnecter');
  }
  if (!response.ok) {
    let msg = `Erreur ${response.status}`;
    try { const b = await response.json(); msg = b.error ?? b.message ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ─── JSON statique fallback ────────────────────────────────────────────────
async function loadJson(name: string): Promise<any[]> {
  try {
    const r = await fetch(`/data/${name}.json`);
    return r.ok ? r.json() : [];
  } catch { return []; }
}

// ─── disponibilité backend (cache 30 s, une seule promesse en vol) ─────────
let _available: boolean | null = null;
let _checking: Promise<boolean> | null = null;

export async function checkBackend(): Promise<boolean> {
  // Si on a déjà un résultat en cache, l'utiliser directement
  if (_available !== null) return _available;
  // Si un check est déjà en cours, attendre ce résultat
  if (_checking) return _checking;

  _checking = (async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000); // 3 s max
      const r = await fetch(`${API_BASE_URL}/health`, { signal: ctrl.signal });
      clearTimeout(timer);
      _available = r.ok;
    } catch {
      _available = false;
    }
    _checking = null;
    // Cache valide 30 s
    setTimeout(() => { _available = null; }, 30_000);
    return _available!;
  })();

  return _checking;
}

// ─── Service public ────────────────────────────────────────────────────────
class ApiService {

  // ---------- LECTURE (fallback JSON si backend absent) ----------
  async getAll(resource: string): Promise<any[]> {
    const ok = await checkBackend();
    if (!ok) {
      console.warn(`[api] backend absent — fallback JSON: ${resource}`);
      return loadJson(resource);
    }
    try {
      return await request(`/${resource}`);
    } catch (err) {
      console.error(`[api] getAll(${resource}):`, err);
      return loadJson(resource);
    }
  }

  async getById(resource: string, id: string): Promise<any> {
    const ok = await checkBackend();
    if (!ok) {
      const list = await loadJson(resource);
      return list.find((x: any) => x.id === id) ?? null;
    }
    try {
      return await request(`/${resource}/${id}`);
    } catch {
      return null;
    }
  }

  // ---------- ÉCRITURE (pas de fallback — l'erreur remonte au composant) ----------
  async create(resource: string, data: any): Promise<any> {
    // Pour les mutations, on essaie directement sans attendre checkBackend
    // (le token prouve qu'on était connecté)
    try {
      return await request(`/${resource}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      // Si c'est une erreur réseau, vider le cache de dispo
      if (err.message?.includes('joindre')) _available = null;
      throw err;
    }
  }

  async update(resource: string, id: string, data: any): Promise<any> {
    try {
      return await request(`/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err.message?.includes('joindre')) _available = null;
      throw err;
    }
  }

  async delete(resource: string, id: string): Promise<void> {
    try {
      await request(`/${resource}/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.message?.includes('joindre')) _available = null;
      throw err;
    }
  }

  // ---------- AUTHENTIFICATION ----------
  async authenticate(email: string, password: string): Promise<any> {
    // Force re-check de disponibilité au login
    _available = null;
    const ok = await checkBackend();

    if (!ok) {
      console.warn('[api] backend absent — authentification locale');
      const users = await loadJson('users');
      const u = users.find((x: any) => x.email === email);
      return u ? { user: u } : null;
    }

    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result?.token) storeToken(result.token);
    return result;
  }

  // ---------- UTILITAIRES ----------
  setToken(t: string)  { storeToken(t); }
  clearToken()         { clearToken(); _available = null; }
  logout()             { clearToken(); _available = null; }
  async healthCheck()  { _available = null; return checkBackend(); }
}

export const apiService = new ApiService();
