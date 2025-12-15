import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { db } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import ScreenHeader from '@/components/ScreenHeader';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  customers?: {
    name: string;
    shop_name: string;
    address: string;
    contact_number: string;
  };
  order_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    products?: { name: string };
  }>;
}

const STATUS_OPTIONS = [
  { value: 'assigned', label: 'Assigned', color: colors.info },
  { value: 'in_transit', label: 'In Transit', color: colors.primary },
  { value: 'delivered', label: 'Delivered', color: colors.success },
  { value: 'issues', label: 'Issues', color: colors.error },
];

export default function DeliveryOrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { userProfile } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await db.orders.getById(id as string);
        setOrder(data);
        setSelectedStatus(data?.status || '');
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order?.status) {
      Alert.alert('Error', 'Please select a different status');
      return;
    }

    setUpdating(true);
    try {
      const { error: updateError } = await db.orders.update(id as string, {
        status: selectedStatus,
      });
      if (updateError) throw updateError;

      const { data: assignment } = await db.deliveryAssignments.getByOrderId(id as string);

      const { error: historyError } = await db.orderStatus.addStatusUpdate({
        order_id: id as string,
        delivery_assignment_id: assignment?.id,
        status: selectedStatus,
        comments: comments || null,
        updated_by: userProfile?.id,
      });
      if (historyError) throw historyError;

      setOrder({ ...order!, status: selectedStatus });
      setComments('');
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Order Details" showHome={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === order.status);

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Order Details" showHome={false} />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Order Number</Text>
              <Text style={styles.value}>{order.order_number}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: (currentStatusOption?.color || colors.textTertiary) + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: currentStatusOption?.color }]}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total Amount</Text>
              <Text style={styles.value}>${order.total_amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{order.customers?.name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Shop</Text>
              <Text style={styles.value}>{order.customers?.shop_name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{order.customers?.contact_number}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{order.customers?.address}</Text>
            </View>
          </View>
        </View>

        {order.order_items && order.order_items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.order_items.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.products?.name}</Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} x ${item.unit_price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>${(item.quantity * item.unit_price).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  selectedStatus === option.value && styles.statusOptionActive,
                  { borderColor: option.color },
                ]}
                onPress={() => setSelectedStatus(option.value)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === option.value && styles.statusOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Comments (optional)</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Add comments about the delivery..."
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleStatusUpdate}
            disabled={updating || selectedStatus === order.status}
          >
            {updating ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text style={styles.buttonText}>Update Status</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemQuantity: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statusOption: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
    flex: 1,
    minWidth: '45%',
  },
  statusOptionActive: {
    backgroundColor: colors.primary,
  },
  statusOptionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusOptionTextActive: {
    color: colors.textLight,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.card,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
});
