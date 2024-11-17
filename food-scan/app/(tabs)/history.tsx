import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getHistory, HistoryItem, clearHistory } from "../../utils/storage";
import { Swipeable } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "scan_history";

const getConfidenceColor = (confidence: string): string => {
  switch (confidence.toLowerCase()) {
    case "high":
      return "#4CAF50"; // Green
    case "mid":
      return "#FFA726"; // Yellow
    case "low":
      return "#FF5252"; // Red
    default:
      return "#FF5252"; // Default to Red for unknown values
  }
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [deletedItem, setDeletedItem] = useState<HistoryItem | null>(null);
  const undoTimeout = useRef<NodeJS.Timeout>();

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(history)) {
      setHistory([]);
    }
    loadHistory();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadHistory();
  };

  const deleteHistoryItem = async (id: string, skipUndo = false) => {
    try {
      if (!Array.isArray(history)) {
        console.error("History is not an array:", history);
        return;
      }

      const itemToDelete = history.find((item) => item.id === id);
      const updatedHistory = history.filter((item) => item.id !== id);

      if (!skipUndo) {
        // Save the deleted item for potential undo
        setDeletedItem(itemToDelete || null);
        setHistory(updatedHistory);

        // Set timeout for auto-commit delete
        if (undoTimeout.current) {
          clearTimeout(undoTimeout.current);
        }

        undoTimeout.current = setTimeout(() => {
          commitDelete(updatedHistory);
          setDeletedItem(null);
        }, 5000); // 5 seconds undo window
      } else {
        await commitDelete(updatedHistory);
      }
    } catch (error) {
      console.error("Error deleting history item:", error);
      Alert.alert("Error", "Failed to delete item. Please try again.");
    }
  };

  const commitDelete = async (updatedHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error committing delete:", error);
      Alert.alert("Error", "Failed to delete item. Please try again.");
    }
  };

  const handleUndo = async () => {
    if (deletedItem && undoTimeout.current) {
      clearTimeout(undoTimeout.current);
      setHistory([...history, deletedItem]);
      setDeletedItem(null);
    }
  };

  const renderRightActions = (
    id: string,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => deleteHistoryItem(id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={24} color="#fff" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Swipeable
      ref={(ref) => (swipeableRefs.current[item.id] = ref)}
      renderRightActions={(progress) => renderRightActions(item.id, progress)}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={styles.historyItem}>
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

        {item.confidenceLevel && (
          <Text
            style={[
              styles.confidence,
              { color: getConfidenceColor(item.confidenceLevel) },
            ]}
          >
            Confidence: {item.confidenceLevel}
          </Text>
        )}

        <View style={styles.allergenContainer}>
          {item.safe ? (
            <View style={styles.safeContainer}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.safeText}>No allergens detected</Text>
            </View>
          ) : (
            <>
              <Text style={styles.allergenTitle}>Found allergens:</Text>
              {item.allergens.map((allergen) => (
                <Text key={allergen} style={styles.allergen}>
                  • {allergen}
                </Text>
              ))}
            </>
          )}
        </View>
      </View>
    </Swipeable>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={48} color="#666" />
            <Text style={styles.emptyText}>No scan history yet</Text>
          </View>
        }
      />

      {deletedItem && (
        <View style={styles.undoContainer}>
          <Text style={styles.undoText}>Item deleted</Text>
          <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
            <Text style={styles.undoButtonText}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginTop: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
  },
  allergenTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF5252",
    marginBottom: 8,
  },
  allergen: {
    color: "#FF5252",
    marginLeft: 10,
    fontSize: 14,
    marginBottom: 4,
  },
  confidence: {
    fontSize: 14,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  deleteAction: {
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  deleteButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  undoContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  undoText: {
    color: "#fff",
    fontSize: 16,
  },
  undoButton: {
    marginLeft: 16,
  },
  undoButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
  },
  safeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  safeText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "500",
  },
});
