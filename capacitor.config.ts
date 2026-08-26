import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ericsand.trackr',
  appName: 'Trackr',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0d1117',
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: '#0d1117',
    },
  },
};

export default config;
