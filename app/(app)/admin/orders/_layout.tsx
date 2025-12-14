import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="list" />
      <Stack.Screen name="create" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}

