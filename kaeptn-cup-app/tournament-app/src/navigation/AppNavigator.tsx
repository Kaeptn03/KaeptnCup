import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import TournamentDetailScreen from '../screens/TournamentDetailScreen';
import BracketScreen from '../screens/BracketScreen';
import StreamsScreen from '../screens/StreamsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateTournamentScreen from '../screens/CreateTournamentScreen';
import ManageNewsScreen from '../screens/ManageNewsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ImpressumScreen from '../screens/ImpressumScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import { theme } from '../theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const DarkNavigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.primary,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tournaments') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Bracket') {
            iconName = focused ? 'git-network' : 'git-network-outline';
          } else if (route.name === 'Streams') {
            iconName = focused ? 'tv' : 'tv-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tournaments" component={TournamentsScreen} />
      <Tab.Screen name="Bracket" component={BracketScreen} />
      <Tab.Screen name="Streams" component={StreamsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkNavigationTheme}>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Main" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            letterSpacing: 1,
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TournamentDetail" 
          component={TournamentDetailScreen}
          options={{ title: 'TOURNAMENT DETAILS' }}
        />
        <Stack.Screen 
          name="Bracket" 
          component={BracketScreen}
          options={{ title: 'TOURNAMENT BRACKET' }}
        />
        <Stack.Screen 
          name="CreateTournament" 
          component={CreateTournamentScreen}
          options={{ title: 'CREATE TOURNAMENT' }}
        />
        <Stack.Screen 
          name="ManageNews" 
          component={ManageNewsScreen}
          options={{ title: 'MANAGE NEWS' }}
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen}
          options={{ title: 'ADMIN DASHBOARD' }}
        />
        <Stack.Screen 
          name="Impressum" 
          component={ImpressumScreen}
          options={{ title: 'IMPRESSUM' }}
        />
        <Stack.Screen 
          name="Privacy" 
          component={PrivacyScreen}
          options={{ title: 'DATENSCHUTZ' }}
        />
        <Stack.Screen 
          name="Terms" 
          component={TermsScreen}
          options={{ title: 'AGB' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
