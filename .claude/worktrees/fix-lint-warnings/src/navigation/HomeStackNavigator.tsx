import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ViewAllTransactionsScreen from '../screens/dashboard/ViewAllTransactionsScreen';

export type HomeStackParamList = {
  HomeDashboard: undefined;
  ViewAllTransactions: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeDashboard" component={DashboardScreen} />
    <Stack.Screen name="ViewAllTransactions" component={ViewAllTransactionsScreen} />
  </Stack.Navigator>
);

export default HomeStackNavigator;
