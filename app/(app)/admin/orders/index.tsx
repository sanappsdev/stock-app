import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { List, Plus, Edit, FileText, Eye } from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function OrdersHubScreen() {
  const MenuCard = ({ icon: Icon, label, onPress, color = colors.primary }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={32} color={color} />
      </View>
      <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.grid}>
          <MenuCard
            icon={List}
            label="Order List"
            onPress={() => router.push('/(app)/admin/orders/list')}
            color={colors.primary}
          />
          <MenuCard
            icon={Plus}
            label="Create Order"
            onPress={() => router.push('/(app)/admin/orders/create')}
            color={colors.success}
          />
          <MenuCard
            icon={FileText}
            label="Order Details"
            onPress={() => router.push('/(app)/admin/orders/list')}
            color={colors.warning}
          />
          <MenuCard
            icon={Edit}
            label="Edit Order"
            onPress={() => router.push('/(app)/admin/orders/list')}
            color={colors.primaryLight}
          />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 120,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});

