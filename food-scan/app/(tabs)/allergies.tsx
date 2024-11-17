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
import { COMMON_ALLERGENS } from "../../utils/constants";

const ALLERGEN_STORAGE_KEY = "user_allergens";

export default function AllergiesScreen() {
  const [allergens, setAllergens] = useState(
    COMMON_ALLERGENS.map((allergen) => ({ ...allergen, enabled: false }))
  );
  const [customAllergens, setCustomAllergens] = useState<
    Array<{ id: string; name: string; enabled: boolean }>
  >([]);
  const [customAllergen, setCustomAllergen] = useState("");

  // Load saved allergens
  useEffect(() => {
    loadSavedAllergens();
  }, []);

  const loadSavedAllergens = async () => {
    try {
      const saved = await AsyncStorage.getItem(ALLERGEN_STORAGE_KEY);
      if (saved) {
        const { common, custom } = JSON.parse(saved);
        setAllergens(
          COMMON_ALLERGENS.map((allergen) => ({
            ...allergen,
            enabled: common.includes(allergen.id),
          }))
        );
        setCustomAllergens(custom || []);
      }
    } catch (error) {
      console.error("Error loading allergens:", error);
    }
  };

  const saveAllergens = async () => {
    try {
      const data = {
        common: allergens.filter((a) => a.enabled).map((a) => a.id),
        custom: customAllergens,
      };
      await AsyncStorage.setItem(ALLERGEN_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving allergens:", error);
    }
  };

  const toggleAllergen = (index: number) => {
    const newAllergens = [...allergens];
    newAllergens[index].enabled = !newAllergens[index].enabled;
    setAllergens(newAllergens);
    saveAllergens();
  };

  const addCustomAllergen = () => {
    if (customAllergen.trim()) {
      const newCustomAllergen = {
        id: `custom-${Date.now()}`,
        name: customAllergen.trim(),
        enabled: true,
      };
      setCustomAllergens([...customAllergens, newCustomAllergen]);
      setCustomAllergen("");
      saveAllergens();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Common Allergens</Text>
      <Text style={styles.subtitle}>
        Toggle the allergens you need to avoid
      </Text>

      {allergens.map((allergen, index) => (
        <View key={allergen.id} style={styles.allergenItem}>
          <View style={styles.allergenInfo}>
            <Text style={styles.allergenText}>{allergen.name}</Text>
            {allergen.enabled && (
              <MaterialIcons name="warning" size={16} color="#FF6B6B" />
            )}
          </View>
          <Switch
            value={allergen.enabled}
            onValueChange={() => toggleAllergen(index)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={allergen.enabled ? "#4CAF50" : "#f4f3f4"}
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
