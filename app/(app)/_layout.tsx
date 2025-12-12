import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Stack, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Settings, Package, Users, Truck, FileText } from 'lucide-react-native';

export default function AppLayout() {
  const { session, loading, isAdmin, isDeliveryPerson } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth/login');
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  if (isAdmin) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e0e0e0',
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="admin/dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin/products"
          options={{
            title: 'Products',
            tabBarIcon: ({ size, color }) => (
              <Package size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin/customers"
          options={{
            title: 'Customers',
            tabBarIcon: ({ size, color }) => (
              <Users size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin/delivery-persons"
          options={{
            title: 'Delivery',
            tabBarIcon: ({ size, color }) => (
              <Truck size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin/orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ size, color }) => (
              <FileText size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    );
  }

  if (isDeliveryPerson) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e0e0e0',
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="delivery/orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ size, color }) => (
              <FileText size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="delivery/map"
          options={{
            title: 'Map',
            tabBarIcon: ({ size, color }) => (
              <Package size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="delivery/profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <Users size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    );
  }

  return null;
}
