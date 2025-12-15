import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/services/database';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import ScreenHeader from '@/components/ScreenHeader';

interface Product {
  id: string;
  name: string;
  company: string;
  selling_price: number;
  quantity: number;
  description?: string;
}

export default function ProductsScreen() {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await db.products.getAll();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await db.products.delete(id);
          if (!error) {
            setProducts(products.filter(p => p.id !== id));
          }
        },
      },
    ]);
  };

  const ProductCard = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCompany}>{item.company}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productDetail}>Price: ${item.selling_price}</Text>
          <Text style={styles.productDetail}>Stock: {item.quantity}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push(`/(app)/admin/products/detail/${item.id}`)}>
          <Eye size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/(app)/admin/products/edit/${item.id}`)}>
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
        title="Products"
        rightAction={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(app)/admin/products/add')}
          >
            <Plus size={20} color={colors.textLight} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={products}
        renderItem={ProductCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProducts} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
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
  productCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  productCompany: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  productDetail: {
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

