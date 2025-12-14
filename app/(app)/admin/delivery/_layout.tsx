import { Stack } from 'expo-router';

export default function DeliveryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="list" />
      <Stack.Screen name="add" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}

