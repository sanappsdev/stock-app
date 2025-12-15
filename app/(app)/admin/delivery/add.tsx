import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { colors } from '@/theme/colors';
import ScreenHeader from '@/components/ScreenHeader';

export default function AddDeliveryPersonScreen() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    whatsapp_number: '',
  });

  const handleAddDeliveryPerson = async () => {
    if (!formData.name || !formData.contact_number) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const personData = {
        ...formData,
        is_active: isActive,
        created_by: userProfile?.id,
      };

      const { error } = await db.deliveryPersons.create(personData);
      if (error) throw error;

      Alert.alert('Success', 'Delivery person added successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add delivery person');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Add Delivery Person" />

      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={formData.name}
          onChangeText={text => setFormData({ ...formData, name: text })}
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

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Active Status</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.borderDark, true: colors.successLight }}
            thumbColor={isActive ? colors.success : colors.error}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAddDeliveryPerson}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.buttonText}>Add Delivery Person</Text>
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
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

