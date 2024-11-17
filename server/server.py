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
    Analyze the food image and respond with ONLY a JSON object containing:
    {
        "food_name": "name of the food",
        "potential_allergens": ["allergen1", "allergen2"],
        "likely_ingredients": ["ingredient1", "ingredient2"],
        "confidence_level": "high/medium/low",
        "warnings": ["any important warnings"]
    }"""

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
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000,
            temperature=0.2
        )
        
        # Get the raw content
        content = response.choices[0].message.content
        print("Raw OpenAI Response:", content)
        
        # Clean up the response by removing markdown code blocks if present
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        
        content = content.strip()
        
        try:
            result = json.loads(content)
            response_data = {
                "success": True,
                "food_name": result["food_name"],
                "potential_allergens": result["potential_allergens"],
                "likely_ingredients": result["likely_ingredients"],
                "confidence_level": result["confidence_level"],
                "warnings": result["warnings"]
            }
            print("Processed response:", response_data)
            return response_data
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            print(f"Raw content: {content}")
            return {
                "food_name": "Unknown Food",
                "potential_allergens": [],
                "likely_ingredients": [],
                "confidence_level": "low",
                "warnings": ["Unable to analyze image properly"]
            }
            
    except Exception as e:
        print(f"OpenAI API error: {str(e)}")
        return {
            "food_name": "Error",
            "potential_allergens": [],
            "likely_ingredients": [],
            "confidence_level": "low",
            "warnings": [f"Error analyzing image: {str(e)}"]
        }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)