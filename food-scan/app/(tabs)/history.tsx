import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Mock data - replace with actual data from your storage
const MOCK_HISTORY = [
  {
    id: "1",
    productName: "Chocolate Chip Cookies",
    date: "2024-03-15",
    safe: false,
    allergens: ["Peanuts", "Wheat"],
  },
  {
    id: "2",
    productName: "Organic Milk",
    date: "2024-03-14",
    safe: true,
    allergens: [],
  },
];

export default function HistoryScreen() {
  const renderItem = ({ item }: { item: (typeof MOCK_HISTORY)[0] }) => (
    <TouchableOpacity style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.productName}>{item.productName}</Text>
        <MaterialIcons
          name={item.safe ? "check-circle" : "warning"}
          size={24}
          color={item.safe ? "#4CAF50" : "#FF5252"}
        />
      </View>

      <Text style={styles.date}>
        {new Date(item.date).toLocaleDateString()}
      </Text>

      {item.allergens.length > 0 && (
        <View style={styles.allergenContainer}>
          <Text style={styles.allergenTitle}>Found allergens:</Text>
          {item.allergens.map((allergen) => (
            <Text key={allergen} style={styles.allergen}>
              • {allergen}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_HISTORY}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 20,
    gap: 15,
  },
  historyItem: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    color: "#666",
    marginTop: 5,
  },
  allergenContainer: {
    marginTop: 10,
  },
  allergenTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  allergen: {
    color: "#FF5252",
    marginLeft: 10,
  },
});
