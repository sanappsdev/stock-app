import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/services/database';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import ScreenHeader from '@/components/ScreenHeader';

interface Customer {
  id: string;
  name: string;
  shop_name: string;
  contact_number: string;
  whatsapp_number?: string;
  address?: string;
}

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await db.customers.getAll();
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Customer', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await db.customers.delete(id);
          if (!error) {
            setCustomers(customers.filter(c => c.id !== id));
          }
        },
      },
    ]);
  };

  const CustomerCard = ({ item }: { item: Customer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.shopName}>{item.shop_name}</Text>
        <View style={styles.customerDetails}>
          <Text style={styles.customerDetail}>{item.contact_number}</Text>
          {item.whatsapp_number && <Text style={styles.customerDetail}>{item.whatsapp_number}</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push(`/(app)/admin/customers/detail/${item.id}`)}>
          <Eye size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/(app)/admin/customers/edit/${item.id}`)}>
          <Edit2 size={20} color={colors.warning} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Customers"
        rightAction={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(app)/admin/customers/add')}
          >
            <Plus size={20} color={colors.textLight} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={customers}
        renderItem={CustomerCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCustomers} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No customers found</Text>
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
  addButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  customerCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  shopName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  customerDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  customerDetail: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
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

