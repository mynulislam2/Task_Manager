import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profile/ProfileService';
import { setDefaultCurrency } from '../utils';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { session, loading, user } = useAuth();

  useEffect(() => {
    if (user) {
      profileService.get(user.id).then(p => {
        if (p?.currency) setDefaultCurrency(p.currency);
      }).catch(() => {});
    }
  }, [user]);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;