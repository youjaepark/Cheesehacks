<p align="center">
  <img src="food-scan/assets/images/AllerView_icon.png" alt="AllerView Logo" width="200" height="200"/>
</p>

<h1 align="center">AllerView</h1>

**Experience Food Safely with AllerView**  
Never worry about hidden ingredients again! AllerView is your personal food safety assistant, powered by advanced AI to help you make confident dining decisions in seconds.

---

## 🚀 Key Features:
- **Real-Time Allergen Detection**: Instantly analyze food for potential allergens.
- **Customizable Allergen Profiles**: Set up personalized allergen preferences for you and your family.
- **RAG System**: Combines retrieval and generative AI for highly accurate allergen identification.
- **Prompt Engineering**: For the best user experience and precise results.
- **Seamless Food Recognition**: Detect and process various food items

---

## 🌟 Technical Overview:

1. **Image Detection**  
   Using **Transfer Learning** from OpenAI models, AllerView accurately identifies food items and potential allergens.

2. **RAG System**  
   Our **Retrieval-Augmented Generation (RAG)** system improves accuracy by using similarity-based models to find relevant food items and allergens.

3. **Database**  
   Powered by **MongoDB**, ensuring fast and reliable data storage for real-time allergen detection.

4. **Frontend & App**  
   Built with **React Native** for cross-platform compatibility, combining TypeScript (frontend), Python (backend), and MongoDB (database).

---

## 📽️ Demonstrations:

- **App Video Demonstration**:  
  [Watch Here](https://drive.google.com/file/d/1h_9aE87udB6FUpW1nJQdhezl0gvbsWQF/view?usp=sharing)  

- **Presentation**:  
  [View Presentation](https://docs.google.com/presentation/d/14H5rwGxhoDALEETZ-2txu6fmpXHAyNMIxLE5XnGUnvI/edit?usp=sharing)

---

## 🛠️ How to Run AllerView

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- Expo Go app installed on your mobile device
- MongoDB installed and running locally

#### Installing Prerequisites

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install Python from [python.org](https://python.org)
3. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
4. Install Expo Go from your device's app store:
   - [iOS App Store](https://apps.apple.com/app/apple-store/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd AllerView
```

2. Install frontend dependencies:

```bash
cd food-scan
npm install
```

3. Install Python backend dependencies:

```bash
cd ../server
pip install -r requirements.txt
```

4. Set up your MongoDB database:

- Start MongoDB servicen m
- Create a new database named 'allerview'

### Running the Project

1. Start the backend server:

```bash
cd server
python server.py
```

2. Start the Expo development server:

```bash
cd food-scan
npx expo start
```

3. Launch the app:

- Scan the QR code with your mobile device's camera
- Open in Expo Go when prompted

### Usage Example

1. First-time setup:

   - Launch the app
   - Go to Settings
   - Select your allergens from the list

2. Scanning food:
   - Tap the camera icon
   - Point your camera at the food item
   - Wait for analysis
   - Review the allergen alerts and ingredient list
   - Save to history if desired

The app will instantly alert you if any allergens are detected and provide a confidence level for the analysis.
