import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Camera } from "expo-camera";

export default function Index() {
  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      router.push("/scan"); // This should now work correctly
    } else {
      alert("Camera permission is required to scan food items");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Allergy Scanner</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <MaterialIcons name="camera-alt" size={32} color="#FFF" />
          <Text style={styles.buttonText}>Scan Food</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    color: "#333",
  },
  buttonContainer: {
    gap: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
