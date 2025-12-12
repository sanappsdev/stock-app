import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react-native';

interface Customer {
  id: string;
  name: string;
  shop_name: string;
}

interface Product {
  id: string;
  name: string;
  selling_price: number;
  quantity: number;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface DeliveryPerson {
  id: string;
  name: string;
}

export default function CreateOrderScreen() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState('1');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes, deliveryRes] = await Promise.all([
          db.customers.getAll(),
          db.products.getAll(),
          db.deliveryPersons.getAll(),
        ]);

        setCustomers(customersRes.data || []);
        setProducts(productsRes.data || []);
        setDeliveryPersons(deliveryRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const addItemToOrder = () => {
    if (!selectedProduct || !productQuantity) {
      Alert.alert('Error', 'Please select product and quantity');
      return;
    }

    const qty = parseInt(productQuantity);
    if (qty > selectedProduct.quantity) {
      Alert.alert('Error', 'Insufficient stock');
      return;
    }

    const newItem: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: qty,
      price: selectedProduct.selling_price,
      total: qty * selectedProduct.selling_price,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct(null);
    setProductQuantity('1');
    setShowProductDropdown(false);
  };

  const removeItemFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0 || !selectedDeliveryPerson) {
      Alert.alert('Error', 'Please complete all fields and add items');
      return;
    }

    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now()}`;
      const totalAmount = getTotalAmount();

      const { data: order, error: orderError } = await db.orders.create({
        order_number: orderNumber,
        customer_id: selectedCustomer.id,
        created_by: userProfile?.id,
        status: 'pending',
        total_amount: totalAmount,
        profit_amount: 0,
        delivery_date: deliveryDate || null,
      });

      if (orderError || !order) throw orderError;

      const itemsData = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.total,
      }));

      const { error: itemsError } = await db.orderItems.create(itemsData);
      if (itemsError) throw itemsError;

      const { error: assignError } = await db.deliveryAssignments.create({
        order_id: order.id,
        delivery_person_id: selectedDeliveryPerson.id,
        assigned_by: userProfile?.id,
      });

      if (assignError) throw assignError;

      await db.orders.update(order.id, { status: 'assigned' });

      Alert.alert('Success', 'Order created and assigned successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const OrderItemCard = ({ item, index }: { item: OrderItem; index: number }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemDetails}>
          {item.quantity} x ${item.price.toFixed(2)} = ${item.total.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => removeItemFromOrder(index)}>
        <Trash2 size={20} color="#f44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Order</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Customer *</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowCustomerDropdown(!showCustomerDropdown)}
        >
          <Text style={styles.dropdownText}>
            {selectedCustomer?.shop_name || 'Select customer'}
          </Text>
        </TouchableOpacity>
        {showCustomerDropdown && (
          <View style={styles.dropdownList}>
            {customers.map(customer => (
              <TouchableOpacity
                key={customer.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerDropdown(false);
                }}
              >
                <Text>{customer.shop_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Delivery Person *</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDeliveryDropdown(!showDeliveryDropdown)}
        >
          <Text style={styles.dropdownText}>
            {selectedDeliveryPerson?.name || 'Select delivery person'}
          </Text>
        </TouchableOpacity>
        {showDeliveryDropdown && (
          <View style={styles.dropdownList}>
            {deliveryPersons.map(person => (
              <TouchableOpacity
                key={person.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedDeliveryPerson(person);
                  setShowDeliveryDropdown(false);
                }}
              >
                <Text>{person.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Delivery Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={deliveryDate}
          onChangeText={setDeliveryDate}
          placeholderTextColor="#999"
        />

        <Text style={styles.sectionTitle}>Add Products</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowProductDropdown(!showProductDropdown)}
        >
          <Text style={styles.dropdownText}>
            {selectedProduct?.name || 'Select product'}
          </Text>
        </TouchableOpacity>
        {showProductDropdown && (
          <View style={styles.dropdownList}>
            {products.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedProduct(product);
                  setShowProductDropdown(false);
                }}
              >
                <Text>{product.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Quantity"
            value={productQuantity}
            onChangeText={setProductQuantity}
            keyboardType="number-pad"
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.addItemButton}
            onPress={addItemToOrder}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {orderItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {orderItems.map((item, index) => (
              <OrderItemCard key={index} item={item} index={index} />
            ))}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${getTotalAmount().toFixed(2)}</Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateOrder}
          disabled={loading || !selectedCustomer || orderItems.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Order</Text>
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
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addItemButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  totalCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
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
