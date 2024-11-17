                                                    AllerView

### Never worry about hidden ingredients again. AllerView is your personal food safety assistant, using advanced AI to help you make confident dining decisions in seconds.<br/>

### 🔍 Simply input your allergies once

### 📸 Snap a photo of your food

### ✨ And get instant allergen alerts<br/><br/>

### Key Features:

### - Real-time allergen detection from photos

### - Customizable allergen profiles for multiple family members

### - RAG combines the power of retrieval and generative systems to improve our accuracy

### - Prompt engineering and further fine tuning to give the best experience possible<br/><br/>

### 1) Image Detection - Using Transfer Learning from ChatGPT for our image detection, we are able to detect and process a variety of food items even when there are multiple involved!

### 2) Database - For our Database we opted for MongoDB, giving us quick and easy access to our data, so we can use our RAG system effectively

### 3) RAG - With transfer learning from OpenAI we created a "Similarity LLM" which gives us similar food items and its allergens to improve the results

### 4) Frontend/App creation - For our frontend and app creation we used React Native to make the app compatible with your phone for quick and convenient use

### (Frontend with TypeScript, Backend with Python, and MQL for Database)

### App Demonstration Video:

### https://drive.google.com/file/d/1h_9aE87udB6FUpW1nJQdhezl0gvbsWQF/view?usp=sharing<br/><br/>

### Presentation:

### https://docs.google.com/presentation/d/14H5rwGxhoDALEETZ-2txu6fmpXHAyNMIxLE5XnGUnvI/edit?usp=sharing

### Experience the joy of food without the fear of allergies!

## How to Run

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
cd ../backend
pip install -r requirements.txt
```

4. Set up your MongoDB database:

- Start MongoDB service
- Create a new database named 'allerview'

### Running the Project

1. Start the backend server:

```bash
cd backend
python app.py
```

2. Start the Expo development server:

```bash
cd food-scan
npm start
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
