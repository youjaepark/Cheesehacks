import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, TouchableOpacity } from "react-native";
import { saveToHistory } from "../utils/storage";
import { useState, useEffect } from "react";

interface FoodAnalysis {
  foodName: string;
  imageUrl?: string;
  allergens: string[];
  ingredients: string[];
}

interface FoodAnalysis {
  foodName: string;
  imageUrl?: string;
  allergens: string[];
  ingredients: string[];
  confidenceLevel?: string;
  warnings?: string[];
}

export default function ResultScreen() {
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const params = useLocalSearchParams<{ data: string }>();
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);

  useEffect(() => {
    try {
      if (params.data) {
        const parsedData = JSON.parse(params.data);
        setAnalysis(parsedData);
      }
    } catch (error) {
      console.error("Error parsing analysis data:", error);
    }
  }, [params.data]);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!analysis || hasSaved || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await saveToHistory({
        foodName: analysis.foodName,
        allergens: analysis.allergens,
        ingredients: analysis.ingredients,
        imageUrl: analysis.imageUrl,
        confidenceLevel: analysis.confidenceLevel,
      });

      setHasSaved(true);
      Alert.alert("Success", "Scan result saved to history", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(tabs)");
          },
        },
      ]);
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save scan result. Please try again.");
      setHasSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!analysis) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>No analysis data available</Text>
      </View>
    );
  }

  const hasAllergens =
    Array.isArray(analysis.allergens) && analysis.allergens.length > 0;

  const getConfidenceColor = (level?: string) => {
    switch (level) {
      case "high":
        return "#4CAF50";
      case "medium":
        return "#FFA000";
      case "low":
        return "#FF6B6B";
      default:
        return "#666";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{analysis.foodName}</Text>
          {analysis.confidenceLevel && (
            <View
              style={[
                styles.confidenceBadge,
                {
                  backgroundColor: getConfidenceColor(analysis.confidenceLevel),
                },
              ]}
            >
              <MaterialIcons name="info" size={16} color="white" />
              <Text style={styles.confidenceText}>
                {analysis.confidenceLevel.charAt(0).toUpperCase() +
                  analysis.confidenceLevel.slice(1)}{" "}
                Confidence
              </Text>
            </View>
          )}
          {analysis.imageUrl && (
            <Image
              source={{ uri: analysis.imageUrl }}
              style={styles.foodImage}
              resizeMode="cover"
            />
          )}
        </View>

        {analysis.warnings && analysis.warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Notes</Text>
            {analysis.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <MaterialIcons name="info" size={20} color="#FFA000" />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergen Information</Text>
          {hasAllergens ? (
            <View style={styles.allergenList}>
              {analysis.allergens.map((allergen, index) => (
                <View key={index} style={styles.allergenItem}>
                  <MaterialIcons name="warning" size={24} color="#FF6B6B" />
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.safeText}>No common allergens detected</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {analysis.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText}>
              • {ingredient}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.saveButton,
            (isSaving || hasSaved) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={isSaving || hasSaved}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save to History</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  foodImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  allergenList: {
    gap: 10,
  },
  allergenItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  allergenText: {
    fontSize: 16,
    color: "#FF6B6B",
    flex: 1,
  },
  safeText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  ingredientText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
    marginBottom: 15,
    gap: 4,
  },
  confidenceText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  warningText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
