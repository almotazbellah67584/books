import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SalesScreen from './src/screens/SalesScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { theme } from './src/theme/theme';

// Enable RTL layout for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#2563eb" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Sales') {
                iconName = focused ? 'cart' : 'cart-outline';
              } else if (route.name === 'Inventory') {
                iconName = focused ? 'library' : 'library-outline';
              } else if (route.name === 'Reports') {
                iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#6b7280',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTitleAlign: 'center',
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'الرئيسية',
              headerTitle: 'نظام إدارة مبيعات الكتب'
            }} 
          />
          <Tab.Screen 
            name="Sales" 
            component={SalesScreen} 
            options={{ title: 'المبيعات' }} 
          />
          <Tab.Screen 
            name="Inventory" 
            component={InventoryScreen} 
            options={{ title: 'المخزون' }} 
          />
          <Tab.Screen 
            name="Reports" 
            component={ReportsScreen} 
            options={{ title: 'التقارير' }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}