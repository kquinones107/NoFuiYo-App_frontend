# Sentry Setup Guide

Sentry has been installed and configured in your app. Follow these steps to complete the setup:

## Step 1: Create a Sentry Account and Project

1. Go to [https://sentry.io](https://sentry.io) and sign up or log in
2. Create a new organization (if you don't have one)
3. Create a new project:
   - Click "Create Project"
   - Select "React Native" as the platform
   - Enter a project name (e.g., "NoFuiYoApp")
   - Choose your organization
   - Click "Create Project"

## Step 2: Get Your DSN

1. After creating the project, Sentry will show you a DSN (Data Source Name)
2. It looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
3. Copy this DSN

## Step 3: Configure the DSN in Your App

You have two options:

### Option A: Using Environment Variable (Recommended)

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following line:
   ```
   EXPO_PUBLIC_SENTRY_DSN=your_dsn_here
   ```
3. Replace `your_dsn_here` with your actual DSN from Step 2

### Option B: Direct Configuration

1. Open `sentry.config.js`
2. Replace `YOUR_SENTRY_DSN` with your actual DSN

## Step 4: Test the Integration

1. Restart your Expo development server
2. Trigger a test error in your app to verify Sentry is working
3. Check your Sentry dashboard to see if the error appears

## Additional Configuration

You can customize Sentry behavior by editing `sentry.config.js`:
- `enableInExpoDevelopment`: Set to `true` to capture errors in development mode
- `debug`: Set to `true` to see Sentry debug logs
- `tracesSampleRate`: Adjust the percentage of transactions to capture (0.0 to 1.0)

## Building for Production

When building your app with EAS Build, Sentry will automatically upload source maps and symbols for better error tracking.

For more information, visit: [https://docs.sentry.io/platforms/react-native/](https://docs.sentry.io/platforms/react-native/)

