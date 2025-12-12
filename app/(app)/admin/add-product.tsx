import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AddProductScreen() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    description: '',
    selling_price: '',
    wholesale_price: '',
    retail_price: '',
    quantity: '',
    unit: 'pc',
    sku: '',
  });

  const handleAddProduct = async () => {
    if (!formData.name || !formData.company || !formData.selling_price || !formData.quantity) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        selling_price: parseFloat(formData.selling_price),
        wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
        retail_price: formData.retail_price ? parseFloat(formData.retail_price) : null,
        quantity: parseInt(formData.quantity),
        created_by: userProfile?.id,
      };

      const { error } = await db.products.create(productData);
      if (error) throw error;

      Alert.alert('Success', 'Product added successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Product</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Product Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter product name"
          value={formData.name}
          onChangeText={text => setFormData({ ...formData, name: text })}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Company *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter company name"
          value={formData.company}
          onChangeText={text => setFormData({ ...formData, company: text })}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter product description"
          value={formData.description}
          onChangeText={text => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Selling Price *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter selling price"
          value={formData.selling_price}
          onChangeText={text => setFormData({ ...formData, selling_price: text })}
          keyboardType="decimal-pad"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Wholesale Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter wholesale price"
          value={formData.wholesale_price}
          onChangeText={text => setFormData({ ...formData, wholesale_price: text })}
          keyboardType="decimal-pad"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Retail Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter retail price"
          value={formData.retail_price}
          onChangeText={text => setFormData({ ...formData, retail_price: text })}
          keyboardType="decimal-pad"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter quantity"
          value={formData.quantity}
          onChangeText={text => setFormData({ ...formData, quantity: text })}
          keyboardType="number-pad"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Unit</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., pc, kg, liter"
          value={formData.unit}
          onChangeText={text => setFormData({ ...formData, unit: text })}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>SKU</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter SKU"
          value={formData.sku}
          onChangeText={text => setFormData({ ...formData, sku: text })}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAddProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Product</Text>
          )}
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
  form: {
    padding: 20,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
