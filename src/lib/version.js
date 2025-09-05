// Application version and build information (CommonJS version for Node.js scripts)
const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '2024.12.19.001';
const BUILD_DATE = new Date().toISOString();
const GIT_COMMIT = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local-dev';

// Feature flags and capabilities
const FEATURES = {
  AGENT_KEY_MANAGEMENT: true,
  RISK_VALIDATION: true,
  REALTIME_MARKET_DATA: true,
  BATCH_ORDERS: true,
  PORTFOLIO_TRACKING: true,
  WEBSOCKET_INTEGRATION: true,
  BALANCE_PANEL: true,
  TRADE_HISTORY: true,
  DIAGNOSTICS: true
};

// Environment information
const ENVIRONMENT = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_VERCEL: !!process.env.VERCEL
};

// Get version info for display
function getVersionInfo() {
  return {
    version: APP_VERSION,
    buildNumber: BUILD_NUMBER,
    buildDate: BUILD_DATE,
    gitCommit: GIT_COMMIT,
    environment: ENVIRONMENT.VERCEL_ENV,
    features: FEATURES
  };
}

// Get short version string for display
function getVersionString() {
  return `v${APP_VERSION} (${BUILD_NUMBER})`;
}

// Get build info for debugging
function getBuildInfo() {
  return {
    version: APP_VERSION,
    buildNumber: BUILD_NUMBER,
    buildDate: BUILD_DATE,
    gitCommit: GIT_COMMIT,
    environment: ENVIRONMENT,
    features: FEATURES,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    timestamp: Date.now()
  };
}

module.exports = {
  APP_VERSION,
  BUILD_NUMBER,
  BUILD_DATE,
  GIT_COMMIT,
  FEATURES,
  ENVIRONMENT,
  getVersionInfo,
  getVersionString,
  getBuildInfo
};

