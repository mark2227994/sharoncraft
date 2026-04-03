import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

// Create stack navigator
const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  >
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'SharonCraft' }}
    />
    <Stack.Screen 
      name="Shop" 
      component={ShopScreen} 
      options={{ title: 'Shop' }}
    />
    <Stack.Screen 
      name="Product" 
      component={ProductScreen} 
      options={{ title: 'Product Details' }}
    />
    <Stack.Screen 
      name="Cart" 
      component={CartScreen} 
      options={{ title: 'Shopping Cart' }}
    />
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'My Account' }}
    />
    <Stack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ title: 'Login' }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <StatusBar style={styles.statusBar} />
            <LinearGradient
              colors={['#f2c94c', '#d8b03b']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AppNavigator />
            </LinearGradient>
          </SafeAreaView>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5e1',
  },
  gradient: {
    flex: 1,
  },
  statusBar: {
    backgroundColor: 'transparent',
    barStyle: 'dark-content',
  },
});
