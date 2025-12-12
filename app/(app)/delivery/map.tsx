import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { db } from '@/services/database';
import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  id: string;
  order_number: string;
  customers?: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  };
}

export default function DeliveryMapScreen() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userProfile?.id) return;

      try {
        const { data: deliveryPersons } = await db.deliveryPersons.getAll();
        const dpId = deliveryPersons?.find((dp: any) => dp.user_id === userProfile.id)?.id;

        if (dpId) {
          const { data } = await db.orders.getByDeliveryPerson(dpId);
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userProfile?.id]);

  const openMap = (latitude: number, longitude: number, address: string) => {
    const scheme = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.openURL(scheme);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Locations</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No delivery locations available</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {orders.map((order, index) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>{order.order_number}</Text>
                <Text style={styles.customerName}>{order.customers?.name}</Text>
                <View style={styles.addressContainer}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.address}>{order.customers?.address}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() =>
                  openMap(
                    order.customers?.latitude || 0,
                    order.customers?.longitude || 0,
                    order.customers?.address || '',
                  )
                }
              >
                <Navigation size={20} color="#fff" />
                <Text style={styles.mapButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  address: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  mapButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
