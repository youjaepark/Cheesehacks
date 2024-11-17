import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ animation: "fade" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="scan"
          options={{
            presentation: "fullScreenModal",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            presentation: "card",
            headerTitle: "Scan Result",
            headerStyle: {
              backgroundColor: "#4CAF50",
            },
            headerTintColor: "#fff",
            gestureEnabled: true,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
