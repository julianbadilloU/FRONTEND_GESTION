const ACCESS_TOKEN_KEY = "furmatch.access_token";
const REFRESH_TOKEN_KEY = "furmatch.refresh_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSessionTokens() {
  if (!isBrowser()) {
    return {
      accessToken: null,
      refreshToken: null,
    };
  }

  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function saveSessionTokens(tokens) {
  if (!isBrowser()) {
    return;
  }

  if (tokens.accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (tokens.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearSessionTokens() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
