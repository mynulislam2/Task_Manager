import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExpenseListScreen from '../screens/expenses/ExpenseListScreen';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import ExpenseDetailsScreen from '../screens/expenses/ExpenseDetailsScreen';
import AddIncomeScreen from '../screens/income/AddIncomeScreen';
import IncomeDetailScreen from '../screens/income/IncomeDetailScreen';
import AddRecurringScreen from '../screens/recurring/AddRecurringScreen';
import CreateBudgetScreen from '../screens/budget/CreateBudgetScreen';

export type FinanceStackParamList = {
  FinanceHome: undefined;
  AddExpense: { expenseId?: string } | undefined;
  ExpenseDetails: { expenseId: string };
  AddIncome: { incomeId?: string } | undefined;
  IncomeDetail: { incomeId: string };
  AddRecurring: undefined;
  CreateBudget: { budgetId?: string } | undefined;
};

const Stack = createNativeStackNavigator<FinanceStackParamList>();

const FinanceStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FinanceHome" component={ExpenseListScreen} />
    <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
    <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
    <Stack.Screen name="IncomeDetail" component={IncomeDetailScreen} />
    <Stack.Screen name="AddRecurring" component={AddRecurringScreen} />
    <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
  </Stack.Navigator>
);

export default FinanceStackNavigator;
