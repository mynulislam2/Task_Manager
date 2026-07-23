import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { CategoriesScreen } from '../screens/categories/CategoriesScreen';
import { Colors, Typography } from '../constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TasksStack() {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textMain,
        headerTitleStyle: Typography.sectionTitle as any,
        headerShadowVisible: false, // Removes default border
      }}
    >
      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ title: 'Task Details', headerBackTitle: '' }} 
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'TasksTab') {
            iconName = 'check-circle-outline';
          } else if (route.name === 'CategoriesTab') {
            iconName = 'folder-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          elevation: 0,
        },
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textMain,
        headerTitleStyle: Typography.sectionTitle as any,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen 
        name="TasksTab" 
        component={TasksStack} 
        options={{ title: 'Tasks', headerShown: false }} 
      />
      <Tab.Screen 
        name="CategoriesTab" 
        component={CategoriesScreen} 
        options={{ title: 'Categories', headerShown: false }} // We rendered custom header inside screen
      />
    </Tab.Navigator>
  );
}
