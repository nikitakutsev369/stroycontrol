/**
 * Конфигурация приложения
 * Для production используется Vite env variables (import.meta.env)
 * Для development — захардкожены значения по умолчанию
 */

function getEnvVar(name: string, defaultValue: string = ''): string {
  // Vite использует import.meta.env для переменных окружения
  const value = import.meta.env[name];
  return value || defaultValue;
}

function required(name: string): string {
  const value = getEnvVar(name);
  if (!value && import.meta.env.PROD) {
    console.warn(`Missing environment variable: ${name}`);
  }
  return value;
}

export const config = {
  // API endpoints
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  
  // App info
  appName: getEnvVar('VITE_APP_NAME', 'СтройКонтроль'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  
  // Feature flags
  enableDemoMode: getEnvVar('VITE_ENABLE_DEMO_MODE', 'true') === 'true',
  
  // OAuth (для будущей интеграции)
  oauthEnabled: getEnvVar('VITE_OAUTH_ENABLED', 'false') === 'true',
  oauthCallbackUrl: getEnvVar('VITE_OAUTH_CALLBACK_URL', '/auth/callback'),
  
  // Environment
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
} as const;

// API endpoints
export const API = {
  // Auth
  login: `${config.apiBaseUrl}/auth/login`,
  logout: `${config.apiBaseUrl}/auth/logout`,
  me: `${config.apiBaseUrl}/auth/me`,
  
  // Projects
  projects: `${config.apiBaseUrl}/projects`,
  project: (id: string) => `${config.apiBaseUrl}/projects/${id}`,
  
  // Brigades
  brigades: `${config.apiBaseUrl}/brigades`,
  brigade: (id: string) => `${config.apiBaseUrl}/brigades/${id}`,
  
  // Foremen
  foremen: `${config.apiBaseUrl}/foremen`,
  foreman: (id: string) => `${config.apiBaseUrl}/foremen/${id}`,
  
  // Stages
  stages: `${config.apiBaseUrl}/stages`,
  stage: (id: string) => `${config.apiBaseUrl}/stages/${id}`,
  
  // Notifications
  notifications: `${config.apiBaseUrl}/notifications`,
  notification: (id: string) => `${config.apiBaseUrl}/notifications/${id}`,
} as const;

export type Config = typeof config;
