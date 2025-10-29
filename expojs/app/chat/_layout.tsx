import { Stack } from 'expo-router';

export default function ChatStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[type]/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
