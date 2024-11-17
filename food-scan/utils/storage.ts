import AsyncStorage from "@react-native-async-storage/async-storage";

export const COMMON_ALLERGENS = [
  { id: "1", name: "Peanuts" },
  { id: "2", name: "Tree Nuts" },
  { id: "3", name: "Milk" },
  { id: "4", name: "Eggs" },
  { id: "5", name: "Soy" },
  { id: "6", name: "Wheat" },
  { id: "7", name: "Fish" },
  { id: "8", name: "Shellfish" },
];

export interface HistoryItem {
  id: string;
  productName: string;
  date: string;
  safe: boolean;
  allergens: string[];
  ingredients: string[];
  imageUrl?: string;
  confidenceLevel?: string;
}

const HISTORY_KEY = "scan_history";

export const saveToHistory = async (analysisData: {
  foodName: string;
  allergens: string[];
  ingredients: string[];
  imageUrl?: string;
  confidenceLevel?: string;
}) => {
  try {
    // Get existing history
    const existingHistory = await getHistory();

    // Create new history item
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      productName: analysisData.foodName,
      date: new Date().toISOString(),
      safe: analysisData.allergens.length === 0,
      allergens: analysisData.allergens,
      ingredients: analysisData.ingredients,
      imageUrl: analysisData.imageUrl,
      confidenceLevel: analysisData.confidenceLevel,
    };

    // Add new item to the beginning of the array
    const updatedHistory = [newItem, ...existingHistory];

    // Keep only the last 50 items
    const trimmedHistory = updatedHistory.slice(0, 50);

    // Save to storage
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));

    return newItem;
  } catch (error) {
    console.error("Error saving to history:", error);
    throw error;
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const history = await AsyncStorage.getItem(HISTORY_KEY);
    if (!history) return [];

    const parsed = JSON.parse(history);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error getting history:", error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  } catch (error) {
    console.error("Error clearing history:", error);
    throw error;
  }
};

export interface UserAllergen {
  id: string;
  name: string;
  enabled: boolean;
}

const USER_ALLERGENS_KEY = "user_allergens";

export const saveUserAllergens = async (allergens: UserAllergen[]) => {
  try {
    console.log("Saving allergens:", allergens);
    if (!Array.isArray(allergens)) {
      throw new Error("Invalid allergens data - not an array");
    }
    await AsyncStorage.setItem(USER_ALLERGENS_KEY, JSON.stringify(allergens));
  } catch (error) {
    console.error("Error saving user allergens:", error);
    throw error;
  }
};

export const getUserAllergens = async (): Promise<UserAllergen[]> => {
  try {
    const allergens = await AsyncStorage.getItem(USER_ALLERGENS_KEY);
    console.log("Raw allergens from storage:", allergens);

    if (!allergens) {
      console.log("No allergens found in storage, returning default allergens");
      // Return default allergens with the correct structure
      return COMMON_ALLERGENS.map((allergen) => ({
        id: allergen.id,
        name: allergen.name,
        enabled: false,
      }));
    }

    const parsed = JSON.parse(allergens);
    console.log("Parsed allergens:", parsed);

    // Check if parsed data has the expected structure
    if (
      parsed &&
      typeof parsed === "object" &&
      ("common" in parsed || "custom" in parsed)
    ) {
      // Convert the old format to the new format
      const commonAllergens = COMMON_ALLERGENS.map((allergen) => ({
        id: allergen.id,
        name: allergen.name,
        enabled: false,
      }));

      return commonAllergens;
    }

    if (Array.isArray(parsed)) {
      return parsed;
    }

    // If we get here, the data is invalid, return default allergens
    return COMMON_ALLERGENS.map((allergen) => ({
      id: allergen.id,
      name: allergen.name,
      enabled: false,
    }));
  } catch (error) {
    console.error("Error getting user allergens:", error);
    return COMMON_ALLERGENS.map((allergen) => ({
      id: allergen.id,
      name: allergen.name,
      enabled: false,
    }));
  }
};
