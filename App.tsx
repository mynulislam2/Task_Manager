import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { hideSplash } from 'react-native-splash-view';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store';
import UIProvider from './src/providers/UIProvider';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      hideSplash();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fbf8ff" />
        <UIProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </UIProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
