import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.fitnessapp',
  appName: 'Fitness App',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1A1A1A",
      showSpinner: false
    }
  }
};

export default config;
