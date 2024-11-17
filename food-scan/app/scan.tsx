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

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<{ uri: string; base64: string } | null>(
    null
  );
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    if (camera) {
      try {
        const photo = await camera.takePictureAsync({
          base64: true,
          quality: 0.5,
          exif: false,
        });
        if (!photo?.base64) {
          Alert.alert("Error", "Failed to capture photo");
          return;
        }
        setPhoto({ uri: photo.uri, base64: photo.base64 });
      } catch (error) {
        Alert.alert("Error", "Failed to capture photo");
        console.error("Camera error:", error);
      }
    }
  };

  const API_URL = `http://10.138.143.169:5000/identify`;

  const handleConfirm = async () => {
    if (!photo?.base64) return;
    setIsLoading(true);

    try {
      console.log("Making API request to:", API_URL);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          image_data: photo.base64,
        }),
      });

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response data:", data);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      const analysisData = {
        foodName: data.food_name || "Unknown Food",
        allergens: Array.isArray(data.potential_allergens)
          ? data.potential_allergens
          : [],
        ingredients: Array.isArray(data.likely_ingredients)
          ? data.likely_ingredients
          : [],
        imageUrl: photo.uri,
        confidenceLevel: data.confidence_level || "low",
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
      };

      router.push({
        pathname: "/(tabs)/result",
        params: {
          data: JSON.stringify(analysisData),
        },
      });
    } catch (error) {
      console.error("API Error Details:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      Alert.alert(
        "Error",
        error instanceof Error
          ? `Analysis failed: ${error.message}`
          : "Failed to analyze the image. Please try again."
      );
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
            onPress={() => setPhoto(null)}
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
    <View style={styles.container}>
      {!photo ? (
        <CameraView style={styles.camera} ref={(ref) => setCamera(ref)}>
          <View style={styles.overlay}>
            <Text style={styles.text}>Scan Your Food Item</Text>
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
});
