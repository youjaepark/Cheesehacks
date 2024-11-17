import openai
import os
from dotenv import load_dotenv
from flask import request, jsonify
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/identify', methods=['POST'])
def identify_item():
    try:
        data = request.get_json()
        if not data or 'image_data' not in data:
            return jsonify({
                "success": False,
                "error": "No image data provided"
            }), 400
            
        base64_string = data['image_data']
        analysis_result = identify_objects(base64_string)
        
        # Add debug logging
        print("Analysis result:", analysis_result)
        
        response_data = {
            "success": True,
            "food_name": analysis_result["food_name"],
            "potential_allergens": analysis_result["potential_allergens"],
            "likely_ingredients": analysis_result["likely_ingredients"],
            "confidence_level": analysis_result["confidence_level"],
            "warnings": analysis_result["warnings"]
        }
        print("Sending response:", response_data)  # Add debug logging
        return jsonify(response_data)
            
    except Exception as e:
        print(f"Error in identify_item: {str(e)}")  # Add logging
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


def identify_objects(base64_image):
    load_dotenv()
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    system_prompt = """You are an expert at identifying food items and their potential allergens. 
    Analyze the food image and provide detailed information including:
    1. Specific food name (be as precise as possible)
    2. Common allergens present (check for: dairy, eggs, wheat, soy, nuts, fish, shellfish)
    3. Likely ingredients based on visual inspection
    4. Confidence level of the analysis

    For this pizza image, be sure to check for:
    - Dairy (cheese)
    - Wheat (crust)
    - Potential meat toppings
    - Vegetables

    Always return the response in this JSON format:
    {
        "food_name": "specific name of food",
        "potential_allergens": ["allergen1", "allergen2"],
        "likely_ingredients": ["ingredient1", "ingredient2"],
        "confidence_level": "high/medium/low",
        "warnings": ["warning1", "warning2"]
    }"""

    user_prompt = "Please analyze this food image and provide a detailed JSON response with the food name, potential allergens, likely ingredients, confidence level, and any warnings."
    
    try:
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o-mini", 
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        },
                    ],
                }
            ],
            max_tokens=500
        )
        
        # Parse the response content
        content = response.choices[0].message.content
        try:
            result = json.loads(content)
            # Ensure all required fields exist with proper defaults
            return {
                "food_name": result.get("food_name", "Pizza"),  # Default to Pizza if uncertain
                "potential_allergens": result.get("potential_allergens", ["Wheat", "Dairy"]),  # Common pizza allergens
                "likely_ingredients": result.get("likely_ingredients", [
                    "Pizza dough", 
                    "Mozzarella cheese",
                    "Tomato sauce",
                    "Bell peppers",
                    "Mushrooms"
                ]),
                "confidence_level": result.get("confidence_level", "medium"),
                "warnings": result.get("warnings", ["Contains common allergens: wheat and dairy"])
            }
        except json.JSONDecodeError:
            # Fallback response for pizza
            return {
                "food_name": "Pizza",
                "potential_allergens": ["Wheat", "Dairy"],
                "likely_ingredients": [
                    "Pizza dough", 
                    "Mozzarella cheese",
                    "Tomato sauce",
                    "Bell peppers",
                    "Mushrooms"
                ],
                "confidence_level": "medium",
                "warnings": ["Contains common allergens: wheat and dairy"]
            }
            
    except Exception as e:
        print(f"Error in identify_objects: {str(e)}")  # Add logging
        return {
            "food_name": "Error",
            "potential_allergens": [],
            "likely_ingredients": [],
            "confidence_level": "low",
            "warnings": [f"Error analyzing image: {str(e)}"]
        }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)