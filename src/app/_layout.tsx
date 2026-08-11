import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/colors';
import { RideProvider } from '@/context/ride';
import { SessionProvider } from '@/context/session';
import { useLoadedFonts } from '@/hooks/use-fonts';

// Keep the native splash visible until we are ready to render our own UI.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useLoadedFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <RideProvider>
          <StatusBar barStyle="dark-content" hidden={false} translucent={false} backgroundColor={Colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="role" />
            <Stack.Screen name="(passenger)" />
            <Stack.Screen name="(driver)" />
            <Stack.Screen name="ride/select" />
            <Stack.Screen name="ride/finding" />
            <Stack.Screen name="ride/assigned" />
            <Stack.Screen name="ride/active" />
            <Stack.Screen name="ride/complete" />
            <Stack.Screen name="ride/driver-request" />
            <Stack.Screen name="ride/drive-active" />
            <Stack.Screen name="ride/drive-complete" />
          </Stack>
        </RideProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
