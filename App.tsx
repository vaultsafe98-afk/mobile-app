/**
 * SafeVault - Secure Crypto Wallet App
 * React Native App with Dark Theme and Neon Accents
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
