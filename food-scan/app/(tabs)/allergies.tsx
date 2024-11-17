import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const DEFAULT_ALLERGENS = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Fish",
  "Shellfish",
  "Soy",
  "Wheat",
];

export default function AllergiesScreen() {
  const [allergens, setAllergens] = useState(
    DEFAULT_ALLERGENS.map((allergen) => ({ name: allergen, enabled: false }))
  );
  const [customAllergen, setCustomAllergen] = useState("");

  const toggleAllergen = (index: number) => {
    const newAllergens = [...allergens];
    newAllergens[index].enabled = !newAllergens[index].enabled;
    setAllergens(newAllergens);
  };

  const addCustomAllergen = () => {
    if (customAllergen.trim()) {
      setAllergens([
        ...allergens,
        { name: customAllergen.trim(), enabled: true },
      ]);
      setCustomAllergen("");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Common Allergens</Text>

      {allergens.map((allergen, index) => (
        <View key={allergen.name} style={styles.allergenItem}>
          <Text style={styles.allergenText}>{allergen.name}</Text>
          <Switch
            value={allergen.enabled}
            onValueChange={() => toggleAllergen(index)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={allergen.enabled ? "#4CAF50" : "#f4f3f4"}
          />
        </View>
      ))}

      <Text style={styles.title}>Add Custom Allergen</Text>
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          value={customAllergen}
          onChangeText={setCustomAllergen}
          placeholder="Enter allergen name"
        />
        <TouchableOpacity style={styles.addButton} onPress={addCustomAllergen}>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#333",
  },
  allergenItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  allergenText: {
    fontSize: 16,
    color: "#333",
  },
  addContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
