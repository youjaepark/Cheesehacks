import { router, Stack } from "expo-router";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { saveToHistory, getUserAllergens } from "../utils/storage";
import { MaterialIcons } from "@expo/vector-icons";
import { COMMON_ALLERGENS } from "../utils/allergens";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<{ uri: string; base64: string } | null>(
    null
  );
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    setIsFullScreen(true);
    if (camera) {
      try {
        const photo = await camera.takePictureAsync({
          base64: true,
          quality: 0.5,
          exif: false,
        });
        if (!photo?.base64) {
          Alert.alert("Error", "Failed to capture photo");
          setIsFullScreen(false);
          return;
        }
        setPhoto({ uri: photo.uri, base64: photo.base64 });
      } catch (error) {
        Alert.alert("Error", "Failed to capture photo");
        console.error("Camera error:", error);
        setIsFullScreen(false);
      }
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setIsFullScreen(false);
  };

  const handleBack = () => {
    router.back();
  };

  const API_URL = `http://10.138.143.169:5000/identify`;

  const handleConfirm = async () => {
    if (!photo?.base64) return;
    setIsLoading(true);

    try {
      const userAllergens = await getUserAllergens();
      console.log("Sending user allergens:", userAllergens);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          image_data: photo.base64,
          user_allergens: userAllergens.filter((a) => a.enabled),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log("Server response:", data);

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      const analysisData = {
        foodName: data.food_name || "Unknown Food",
        allergens: data.potential_allergens || [],
        ingredients: data.likely_ingredients || [],
        imageUrl: photo.uri,
        confidenceLevel: data.confidence_level || "low",
        warnings: data.warnings || [],
      };

      await router.replace({
        pathname: "/(tabs)",
      });

      router.push({
        pathname: "/result",
        params: {
          data: JSON.stringify(analysisData),
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Failed to analyze the image. Please try again.", [
        { text: "OK" },
      ]);

      const errorData = {
        foodName: "Error",
        allergens: [],
        ingredients: [],
        imageUrl: photo.uri,
        confidenceLevel: "low",
        warnings: ["Failed to analyze the image. Please try again."],
      };

      await router.replace({
        pathname: "/(tabs)",
      });

      router.push({
        pathname: "/result",
        params: {
          data: JSON.stringify(errorData),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreviewContent = () => (
    <View style={styles.previewContainer}>
      <Image source={{ uri: photo?.uri }} style={styles.preview} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing image...</Text>
        </View>
      ) : (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleRetake}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, isFullScreen && styles.fullScreen]}>
      {!photo ? (
        <CameraView style={styles.camera} ref={(ref) => setCamera(ref)}>
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                accessibilityLabel="Go back to Index Page"
                accessibilityRole="button"
              >
                <MaterialIcons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.text}>Scan Your Food Item</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={takePicture}>
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      ) : (
        renderPreviewContent()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    padding: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 30,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  preview: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonSecondary: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  buttonPrimary: {
    backgroundColor: "#4CAF50",
  },
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
  },
});
