import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/database';
import { useState, useEffect } from 'react';
import { Package, Users, Truck, ShoppingCart, BarChart3, LogOut } from 'lucide-react-native';

interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalDeliveryPersons: number;
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCustomers: 0,
    totalDeliveryPersons: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [productsRes, customersRes, deliveryRes, ordersRes, revenueRes, profitRes] =
        await Promise.all([
          db.products.getAll(),
          db.customers.getAll(),
          db.deliveryPersons.getAll(),
          db.orders.getAll(),
          db.analytics.getTotalRevenue(),
          db.analytics.getTotalProfit(),
        ]);

      setStats({
        totalProducts: productsRes.data?.length || 0,
        totalCustomers: customersRes.data?.length || 0,
        totalDeliveryPersons: deliveryRes.data?.length || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalRevenue: revenueRes.total || 0,
        totalProfit: profitRes.total || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const MenuCard = ({ icon: Icon, label, value, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Icon size={32} color="#007AFF" />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.row}>
          <MenuCard
            icon={Package}
            label="Products"
            value={stats.totalProducts}
            onPress={() => router.push('/(app)/admin/products')}
          />
          <MenuCard
            icon={Users}
            label="Customers"
            value={stats.totalCustomers}
            onPress={() => router.push('/(app)/admin/customers')}
          />
        </View>

        <View style={styles.row}>
          <MenuCard
            icon={Truck}
            label="Delivery Persons"
            value={stats.totalDeliveryPersons}
            onPress={() => router.push('/(app)/admin/delivery-persons')}
          />
          <MenuCard
            icon={ShoppingCart}
            label="Orders"
            value={stats.totalOrders}
            onPress={() => router.push('/(app)/admin/orders')}
          />
        </View>
      </View>

      <View style={styles.analyticsSection}>
        <Text style={styles.sectionTitle}>Sales Overview</Text>

        <View style={styles.analyticsCard}>
          <View style={styles.analyticsRow}>
            <Text style={styles.analyticsLabel}>Total Revenue</Text>
            <Text style={styles.analyticsValue}>
              ${stats.totalRevenue.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.analyticsRow}>
            <Text style={styles.analyticsLabel}>Total Profit</Text>
            <Text style={[styles.analyticsValue, { color: '#4CAF50' }]}>
              ${stats.totalProfit.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.analyticsButton}
          onPress={() => router.push('/(app)/admin/orders')}
        >
          <BarChart3 size={20} color="#007AFF" />
          <Text style={styles.analyticsButtonText}>View Detailed Analytics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statsContainer: {
    padding: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
  analyticsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  analyticsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  analyticsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
