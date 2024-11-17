import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4CAF50",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#666",
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarLabelStyle: {
          marginTop: 4,
        },
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="history"
        options={{
          title: "Scan History",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="history"
              size={27}
              color={color}
              style={{ marginTop: 3 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Image
              source={require("../../assets/images/AllerView_icon.png")}
              style={{
                width: 30,
                height: 30,
                tintColor: "#444",
              }}
            />
          ),
          title: "Main Page",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/AllerView_icon.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#4CAF50" : "#666",
                marginTop: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="allergies"
        options={{
          title: "My Allergies",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="settings"
              size={24}
              color={color}
              style={{ marginTop: 4 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
