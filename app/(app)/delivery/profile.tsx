import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/database';
import { useState, useEffect } from 'react';
import { Phone, MapPin, LogOut } from 'lucide-react-native';

interface DeliveryPerson {
  name: string;
  contact_number: string;
  whatsapp_number?: string;
  address?: string;
  is_active: boolean;
}

export default function DeliveryProfileScreen() {
  const { userProfile, signOut } = useAuth();
  const [profile, setProfile] = useState<DeliveryPerson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userProfile?.id) return;

      try {
        const { data: deliveryPersons } = await db.deliveryPersons.getAll();
        const person = deliveryPersons?.find((dp: any) => dp.user_id === userProfile.id);
        setProfile(person || null);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userProfile?.id]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/auth/login');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      {profile ? (
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <Text style={styles.name}>{profile.name}</Text>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: profile.is_active ? '#4CAF50' : '#f44336',
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              <View style={styles.infoRow}>
                <Phone size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{profile.contact_number}</Text>
                </View>
              </View>

              {profile.whatsapp_number && (
                <View style={styles.infoRow}>
                  <Phone size={20} color="#25D366" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>WhatsApp</Text>
                    <Text style={styles.infoValue}>{profile.whatsapp_number}</Text>
                  </View>
                </View>
              )}

              {profile.address && (
                <View style={styles.infoRow}>
                  <MapPin size={20} color="#FF6B6B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{profile.address}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.emailSection}>
              <Text style={styles.sectionTitle}>Account Email</Text>
              <Text style={styles.email}>{userProfile?.email}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Profile not found</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  emailSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  email: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
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
