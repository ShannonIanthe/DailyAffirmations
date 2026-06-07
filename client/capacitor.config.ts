import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailyaffirm.app',
  appName: 'Daily Affirm',
  webDir: 'dist',
  bundledWebRuntime: false,

  server: {
    // For development: point to the dev server
    // For production: the Express API must be deployed to a server
    // and this URL updated accordingly
    url: undefined, // Set to 'http://YOUR_SERVER_IP:3001' for production build
    cleartext: true, // Allow HTTP for local development
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFF7ED',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFF7ED',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#A78BFA',
    },
  },

  // iOS specific
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
  },
};

export default config;