import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Stack, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Package, Users, Truck, FileText } from 'lucide-react-native';

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
    // Only these routes should appear as tabs
    const mainTabs = new Set([
      'admin/dashboard',
      'admin/orders',
      'admin/products',
      'admin/customers',
      'admin/delivery',
    ]);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Tabs
          screenOptions={({ route }) => {
            const routeName = route.name;
            const shouldShow = mainTabs.has(routeName);

            return {
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#fff',
                borderTopColor: '#e0e0e0',
                borderTopWidth: 1,
                display: shouldShow ? 'flex' : 'none',
                height: 72,
                borderBottomWidth: 0,
                shadowColor: 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 0,
              },
              tabBarButton: shouldShow ? undefined : () => null,
              tabBarItemStyle: shouldShow ? undefined : { display: 'none' },
            };
          }}
          initialRouteName="admin/dashboard"
        >
          <Tabs.Screen
            name="admin/dashboard"
            options={{
              title: 'Home',
              tabBarIcon: ({ size, color }) => (
                <Home size={size} color={color} />
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
            name="admin/delivery"
            options={{
              title: 'Delivery',
              tabBarIcon: ({ size, color }) => (
                <Truck size={size} color={color} />
              ),
            }}
          />
          {/* Hide all nested routes - they're handled by Stack navigators */}
          <Tabs.Screen
            name="admin/orders/list"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/orders/create"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/orders/detail"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/orders/edit"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/products/list"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/products/add"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/products/detail"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/products/edit"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/customers/list"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/customers/add"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/customers/detail"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/customers/edit"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/delivery/list"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/delivery/add"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/delivery/detail"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="admin/delivery/edit"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="delivery"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="delivery/orders"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="delivery/map"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="delivery/profile"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="delivery/order-detail"
            options={{ href: null }}
          />
        </Tabs>
      </SafeAreaView>
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
        {/* Hide folder routes from tabs */}
        <Tabs.Screen
          name="admin"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="delivery"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  return null;
}
