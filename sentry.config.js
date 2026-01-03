// Sentry configuration file
// Replace YOUR_SENTRY_DSN with your actual DSN from https://sentry.io/settings/YOUR_ORG/projects/YOUR_PROJECT/keys/

export default {
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "YOUR_SENTRY_DSN",
  enableInExpoDevelopment: false, // Set to true if you want to test in development
  debug: false, // If `true`, Sentry will try to print out useful debugging information
  tracesSampleRate: 1.0, // Capture 100% of the transactions for performance monitoring
  enableAutoSessionTracking: true, // Enable automatic session tracking
  sessionTrackingIntervalMillis: 30000, // Session tracking interval
};

