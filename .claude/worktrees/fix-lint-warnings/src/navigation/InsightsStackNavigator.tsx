import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateBudgetScreen from '../screens/budget/CreateBudgetScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';

export type InsightsStackParamList = {
  InsightsHome: undefined;
  CreateBudget: undefined;
};

const Stack = createNativeStackNavigator<InsightsStackParamList>();

const InsightsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="InsightsHome" component={AnalyticsScreen} />
    <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
  </Stack.Navigator>
);

export default InsightsStackNavigator;
