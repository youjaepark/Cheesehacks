import AsyncStorage from "@react-native-async-storage/async-storage";

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
    return history ? JSON.parse(history) : [];
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
