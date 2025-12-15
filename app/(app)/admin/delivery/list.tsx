import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/services/database';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import ScreenHeader from '@/components/ScreenHeader';

interface DeliveryPerson {
  id: string;
  name: string;
  contact_number: string;
  whatsapp_number?: string;
  address?: string;
  is_active: boolean;
}

export default function DeliveryPersonsScreen() {
  const [persons, setPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersons = useCallback(async () => {
    try {
      const { data } = await db.deliveryPersons.getAll();
      setPersons(data || []);
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Delivery Person', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await db.deliveryPersons.delete(id);
          if (!error) {
            setPersons(persons.filter(p => p.id !== id));
          }
        },
      },
    ]);
  };

  const PersonCard = ({ item }: { item: DeliveryPerson }) => (
    <View style={styles.personCard}>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: item.is_active ? colors.success : colors.error }]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.personDetails}>
          <Text style={styles.personDetail}>{item.contact_number}</Text>
          {item.whatsapp_number && <Text style={styles.personDetail}>{item.whatsapp_number}</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push(`/(app)/admin/delivery/detail/${item.id}`)}>
          <Eye size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/(app)/admin/delivery/edit/${item.id}`)}>
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
        title="Delivery Persons"
        rightAction={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(app)/admin/delivery/add')}
          >
            <Plus size={20} color={colors.textLight} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={persons}
        renderItem={PersonCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPersons} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No delivery persons found</Text>
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
  personCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.backgroundDark,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  personDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  personDetail: {
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

