import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { paperTheme } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
