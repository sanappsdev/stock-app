import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const webStorageAdapter = {
  getItem: (key: string) => {
    try {
      const item = localStorage?.getItem(key);
      return item ? Promise.resolve(item) : Promise.resolve(null);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage?.setItem(key, value);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage?.removeItem(key);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
};

const nativeStorageAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const storageAdapter = Platform.OS === 'web' ? webStorageAdapter : nativeStorageAdapter;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
