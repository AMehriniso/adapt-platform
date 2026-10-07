const TOKEN_KEY = "adapt_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getRole() {
  const token = getToken();
  if (!token) return "";

  try {
    const payloadPart = token.split(".")[1];
    const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    return payload.role || "";
  } catch {
    return "";
  }
}

export function isAdmin() {
  return getRole() === "ADMIN";
}

export function isMentor() {
  return getRole() === "MENTOR";
}