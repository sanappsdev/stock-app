import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { colors } from '@/theme/colors';
import ScreenHeader from '@/components/ScreenHeader';

export default function AddCustomerScreen() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shop_name: '',
    shop_person_name: '',
    contact_number: '',
    whatsapp_number: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const handleAddCustomer = async () => {
    if (!formData.name || !formData.shop_name || !formData.contact_number) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const customerData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        created_by: userProfile?.id,
      };

      const { error } = await db.customers.create(customerData);
      if (error) throw error;

      Alert.alert('Success', 'Customer added successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Add Customer" />

      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter customer name"
          value={formData.name}
          onChangeText={text => setFormData({ ...formData, name: text })}
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>Shop Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter shop name"
          value={formData.shop_name}
          onChangeText={text => setFormData({ ...formData, shop_name: text })}
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>Shop Person Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter shop person name"
          value={formData.shop_person_name}
          onChangeText={text => setFormData({ ...formData, shop_person_name: text })}
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact number"
          value={formData.contact_number}
          onChangeText={text => setFormData({ ...formData, contact_number: text })}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>WhatsApp Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter WhatsApp number"
          value={formData.whatsapp_number}
          onChangeText={text => setFormData({ ...formData, whatsapp_number: text })}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter address"
          value={formData.address}
          onChangeText={text => setFormData({ ...formData, address: text })}
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter latitude"
          value={formData.latitude}
          onChangeText={text => setFormData({ ...formData, latitude: text })}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter longitude"
          value={formData.longitude}
          onChangeText={text => setFormData({ ...formData, longitude: text })}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textTertiary}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAddCustomer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.buttonText}>Add Customer</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.backgroundLight,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

