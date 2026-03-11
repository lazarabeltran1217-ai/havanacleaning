import * as SecureStore from "expo-secure-store";

const API_BASE = "https://havanacleaning.com";

let sessionCookie: string | null = null;

async function getSessionCookie(): Promise<string | null> {
  if (sessionCookie) return sessionCookie;
  const stored = await SecureStore.getItemAsync("session_cookie");
  if (stored) sessionCookie = stored;
  return sessionCookie;
}

async function setSessionCookie(cookie: string) {
  sessionCookie = cookie;
  await SecureStore.setItemAsync("session_cookie", cookie);
}

export async function clearSession() {
  sessionCookie = null;
  await SecureStore.deleteItemAsync("session_cookie");
}

export async function apiLogin(email: string, password: string) {
  // Get CSRF token first
  const csrfRes = await fetch(`${API_BASE}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const csrfCookies = csrfRes.headers.get("set-cookie") || "";

  // Sign in with credentials
  const res = await fetch(`${API_BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfCookies,
    },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      json: "true",
    }).toString(),
    redirect: "manual",
  });

  // Extract session cookie from redirect
  // Production HTTPS uses __Secure- prefix, dev uses plain name
  const setCookie = res.headers.get("set-cookie") || "";
  const secureMatch = setCookie.match(/__Secure-next-auth\.session-token=([^;]+)/);
  const plainMatch = setCookie.match(/(?<![_-])next-auth\.session-token=([^;]+)/);
  const sessionMatch = secureMatch || plainMatch;
  if (!sessionMatch) {
    throw new Error("Invalid email or password");
  }

  const cookieName = secureMatch ? "__Secure-next-auth.session-token" : "next-auth.session-token";
  await setSessionCookie(`${cookieName}=${sessionMatch[1]}`);

  // Fetch session to get user info
  const session = await apiGet("/api/auth/session");
  return session;
}

export async function apiGet(path: string) {
  const cookie = await getSessionCookie();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  if (!res.ok) {
    if (res.status === 401) {
      await clearSession();
      throw new Error("Session expired");
    }
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path: string, body: Record<string, unknown>) {
  const cookie = await getSessionCookie();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) {
      await clearSession();
      throw new Error("Session expired");
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function apiDelete(path: string, body: Record<string, unknown>) {
  const cookie = await getSessionCookie();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) {
      await clearSession();
      throw new Error("Session expired");
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const res = await fetch(`${API_BASE}/api/account/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Registration failed");

  // Auto-login after registration
  return apiLogin(data.email, data.password);
}

export async function getSession() {
  try {
    const cookie = await getSessionCookie();
    if (!cookie) return null;
    const session = await apiGet("/api/auth/session");
    if (session?.user?.id) return session;
    return null;
  } catch {
    return null;
  }
}
