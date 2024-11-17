import { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COMMON_ALLERGENS } from "../../utils/allergens";
import {
  saveUserAllergens,
  getUserAllergens,
  UserAllergen,
} from "../../utils/storage";

export default function AllergiesScreen() {
  const [allergens, setAllergens] = useState<UserAllergen[]>(
    COMMON_ALLERGENS.map((allergen) => ({
      id: allergen.id,
      name: allergen.name,
      enabled: false,
    }))
  );

  useEffect(() => {
    loadSavedAllergens();
  }, []);

  const loadSavedAllergens = async () => {
    try {
      const savedAllergens = await getUserAllergens();

      if (Array.isArray(savedAllergens) && savedAllergens.length > 0) {
        setAllergens(savedAllergens);
      } else {
        setAllergens(
          COMMON_ALLERGENS.map((allergen) => ({
            id: allergen.id,
            name: allergen.name,
            enabled: false,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading allergens:", error);
    }
  };

  const toggleAllergen = async (index: number) => {
    const newAllergens = [...allergens];
    newAllergens[index].enabled = !newAllergens[index].enabled;
    setAllergens(newAllergens);
    await saveUserAllergens(newAllergens);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Allergens</Text>
      <Text style={styles.subtitle}>
        Toggle the allergens you need to avoid. We'll warn you when scanning
        foods containing these ingredients.
      </Text>

      {allergens.map((allergen, index) => (
        <View key={allergen.id} style={styles.allergenItem}>
          <View style={styles.allergenInfo}>
            <MaterialIcons
              name={allergen.enabled ? "error-outline" : "check-circle-outline"}
              size={24}
              color={allergen.enabled ? "#FF6B6B" : "#4CAF50"}
            />
            <Text style={styles.allergenText}>{allergen.name}</Text>
          </View>
          <Switch
            value={allergen.enabled}
            onValueChange={() => toggleAllergen(index)}
            trackColor={{ false: "#767577", true: "#FF6B6B" }}
            thumbColor={allergen.enabled ? "#FF4444" : "#f4f3f4"}
          />
        </View>
      ))}
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
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  allergenInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
