import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/services/database';
import { useState, useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import ScreenHeader from '@/components/ScreenHeader';

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customers?: { name: string; shop_name: string };
}

export default function DeliveryOrdersScreen() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      const { data: deliveryPerson } = await db.deliveryPersons.getAll();
      const dpId = deliveryPerson?.find((dp: any) => dp.user_id === userProfile.id)?.id;

      if (dpId) {
        const { data } = await db.orders.getByDeliveryPerson(dpId);
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'assigned':
        return colors.info;
      case 'in_transit':
        return colors.primary;
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  const OrderCard = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>{item.order_number}</Text>
        <Text style={styles.customerName}>{item.customers?.shop_name || 'Unknown'}</Text>
        <View style={styles.orderDetails}>
          <Text style={styles.orderDetail}>Amount: ${item.total_amount.toFixed(2)}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push(`/(app)/delivery/order-detail/${item.id}`)}>
        <Eye size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Orders" showHome={false} />

      <FlatList
        data={orders}
        renderItem={OrderCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders assigned</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  orderDetails: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  orderDetail: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
});
