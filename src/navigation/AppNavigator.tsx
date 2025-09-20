import React from 'react';
import { Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { handleBlockedUser } from '../store/slices/authSlice';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import BlockedUserScreen from '../screens/BlockedUserScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SecurityScreen from '../screens/SecurityScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DepositScreen from '../screens/DepositScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import WalletScreen from '../screens/WalletScreen';
import AboutScreen from '../screens/AboutScreen';
import NotificationBanner from '../components/NotificationBanner';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconComponent;

          switch (route.name) {
            case 'Profile':
              iconComponent = (
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>👤</Text>
              );
              break;
            case 'Deposit':
              iconComponent = (
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>💰</Text>
              );
              break;
            case 'Withdraw':
              iconComponent = (
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>💸</Text>
              );
              break;
            case 'Wallet':
              iconComponent = (
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>💼</Text>
              );
              break;
            case 'Discover':
              iconComponent = (
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>✨</Text>
              );
              break;
            default:
              iconComponent = (
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>❓</Text>
              );
          }

          return iconComponent;
        },
        tabBarActiveTintColor: '#00ff88', // Neon green
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1a1a1a', // Dark background
          borderTopColor: '#333',
        },
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Deposit" component={DepositScreen} />
      <Tab.Screen 
        name="Discover" 
        component={AboutScreen}
        options={{
          title: 'Discover SafeVault',
        }}
      />
      <Tab.Screen name="Withdraw" component={WithdrawScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main Stack Navigator (includes tabs and modal screens)
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: 'Edit Profile',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="Security" 
        component={SecurityScreen}
        options={{
          headerShown: true,
          title: 'Security Settings',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          headerShown: true,
          title: 'Notifications',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const [isLoading, setIsLoading] = React.useState(true);
  const { isAuthenticated, user, error } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    // Simulate splash screen delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Check for blocked user on app startup
  React.useEffect(() => {
    if (user && user.status === 'blocked') {
      dispatch(handleBlockedUser());
      Alert.alert(
        'Account Blocked',
        'Your account has been blocked. Please contact support for more information.',
        [{ text: 'OK' }]
      );
    }
  }, [user, dispatch]);

  // Show blocked user error if present
  React.useEffect(() => {
    if (error && error.includes('ACCOUNT_BLOCKED')) {
      Alert.alert(
        'Account Blocked',
        'Your account has been blocked. Please contact support for more information.',
        [{ text: 'OK' }]
      );
    }
  }, [error]);

  if (isLoading) {
    return <SplashScreen />;
  }

  // Check if user is blocked
  const isBlocked = user?.status === 'blocked' || error?.includes('ACCOUNT_BLOCKED');

  return (
    <NavigationContainer>
      {isBlocked ? (
        <BlockedUserScreen />
      ) : isAuthenticated ? (
        <>
          <MainStack />
          <NotificationBanner />
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
