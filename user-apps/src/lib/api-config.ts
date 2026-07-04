/**
 * API configuration — resolves at module-import time.
 *
 * In production (Vite build), import.meta.env.PROD is replaced with `true`,
 * so we always return the Render API URL regardless of what VITE_API_BASE
 * is set to in the build environment.
 *
 * In development, VITE_API_BASE from .env / shell is used, falling back to
 * localhost.
 */
function getApiBase(): string {
  if (import.meta.env.PROD) {
    return 'https://ogbenjuwa-api.onrender.com/api/v1';
  }
  return (import.meta.env.VITE_API_BASE as string | undefined) || 'http://localhost:4001/api/v1';
}

function getWsUrl(): string {
  return getApiBase().replace(/^http/, 'ws').replace(/\/api\/v1\/?$/, '') + '/ws';
}

export const API_BASE = getApiBase();
export const WS_URL = getWsUrl();
