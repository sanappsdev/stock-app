import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { List, Plus, Edit, Truck, Eye } from 'lucide-react-native';

export default function DeliveryHubScreen() {
  const MenuCard = ({ icon: Icon, label, onPress, color = '#007AFF' }: any) => (
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
        <Text style={styles.title}>Delivery</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.grid}>
          <MenuCard
            icon={List}
            label="Delivery Person List"
            onPress={() => router.push('/(app)/admin/delivery/list')}
            color="#007AFF"
          />
          <MenuCard
            icon={Plus}
            label="Add Delivery Person"
            onPress={() => router.push('/(app)/admin/delivery/add')}
            color="#4CAF50"
          />
          <MenuCard
            icon={Eye}
            label="Delivery Person Details"
            onPress={() => router.push('/(app)/admin/delivery/list')}
            color="#FF9800"
          />
          <MenuCard
            icon={Edit}
            label="Edit Delivery Person"
            onPress={() => router.push('/(app)/admin/delivery/list')}
            color="#9C27B0"
          />
        </View>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
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
    color: '#1a1a1a',
    textAlign: 'center',
  },
});

