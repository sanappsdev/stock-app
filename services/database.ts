import { supabase } from './supabase';

export const db = {
  products: {
    async getAll() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return { data, error };
    },

    async create(product: any) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id: string) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      return { error };
    },
  },

  customers: {
    async getAll() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return { data, error };
    },

    async create(customer: any) {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id: string) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      return { error };
    },
  },

  deliveryPersons: {
    async getAll() {
      const { data, error } = await supabase
        .from('delivery_persons')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('delivery_persons')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return { data, error };
    },

    async create(person: any) {
      const { data, error } = await supabase
        .from('delivery_persons')
        .insert([person])
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('delivery_persons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id: string) {
      const { error } = await supabase.from('delivery_persons').delete().eq('id', id);
      return { error };
    },
  },

  orders: {
    async getAll() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(*), delivery_assignments(*, delivery_persons(*)), order_items(*, products(*))')
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(*), delivery_assignments(*, delivery_persons(*)), order_items(*, products(*))')
        .eq('id', id)
        .maybeSingle();
      return { data, error };
    },

    async getByDeliveryPerson(deliveryPersonId: string) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(*), delivery_assignments(*, delivery_persons(*)), order_items(*, products(*)), order_status_history(*)')
        .eq('delivery_assignments.delivery_person_id', deliveryPersonId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async create(order: any) {
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id: string) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      return { error };
    },
  },

  orderItems: {
    async create(items: any[]) {
      const { data, error } = await supabase
        .from('order_items')
        .insert(items)
        .select();
      return { data, error };
    },

    async deleteByOrderId(orderId: string) {
      const { error } = await supabase.from('order_items').delete().eq('order_id', orderId);
      return { error };
    },
  },

  deliveryAssignments: {
    async create(assignment: any) {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .insert([assignment])
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async getByOrderId(orderId: string) {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .select('*, delivery_persons(*)')
        .eq('order_id', orderId)
        .maybeSingle();
      return { data, error };
    },
  },

  orderStatus: {
    async addStatusUpdate(statusUpdate: any) {
      const { data, error } = await supabase
        .from('order_status_history')
        .insert([statusUpdate])
        .select()
        .single();
      return { data, error };
    },

    async getOrderHistory(orderId: string) {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
  },

  analytics: {
    async getTotalOrders() {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      return { count, error };
    },

    async getTotalRevenue() {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount');
      const total = data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      return { total, error };
    },

    async getTotalProfit() {
      const { data, error } = await supabase
        .from('orders')
        .select('profit_amount');
      const total = data?.reduce((sum, order) => sum + (order.profit_amount || 0), 0) || 0;
      return { total, error };
    },

    async getOrdersByStatus() {
      const { data, error } = await supabase
        .from('orders')
        .select('status');

      const statusCount = {
        pending: 0,
        assigned: 0,
        in_transit: 0,
        delivered: 0,
        cancelled: 0,
      };

      data?.forEach((order: any) => {
        statusCount[order.status as keyof typeof statusCount]++;
      });

      return { statusCount, error };
    },
  },
};
