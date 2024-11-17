import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Camera } from "expo-camera";

export default function Index() {
  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      router.push("/scan");
    } else {
      alert("Camera permission is required to scan food items");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AllerView!</Text>

      <Text style={styles.subtitle}>Your ultimate food safety companion</Text>

      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔍</Text>
          <Text style={styles.featureTitle}>Personalized Setting</Text>
          <Text style={styles.featureText}>
            Input your allergies once for tailored alerts
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📸</Text>
          <Text style={styles.featureTitle}>Effortless Scanning</Text>
          <Text style={styles.featureText}>
            Snap a photo and get instant insights
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>✨</Text>
          <Text style={styles.featureTitle}>Peace of Mind</Text>
          <Text style={styles.featureText}>
            Receive immediate allergen alerts
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={openCamera}>
        <MaterialIcons name="camera-alt" size={40} color="#FFF" />
        <Text style={styles.scanButtonText}>Scan Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
    color: "#555",
  },
  featuresContainer: {
    flex: 1,
    gap: 20,
  },
  featureItem: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  featureText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  scanButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#4CAF50",
    width: 160,
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
});
