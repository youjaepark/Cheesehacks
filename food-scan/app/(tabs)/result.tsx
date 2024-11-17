import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

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
  const params = useLocalSearchParams<{ data: string }>();
  const analysis: FoodAnalysis = params.data ? JSON.parse(params.data) : null;

  if (!analysis) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>No analysis data available</Text>
      </View>
    );
  }

  const hasAllergens = analysis.allergens && analysis.allergens.length > 0;

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{analysis.foodName}</Text>
        {analysis.confidenceLevel && (
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(analysis.confidenceLevel) },
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
});
