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
        user_allergens = data.get('user_allergens', [])
        print("Received user allergens:", user_allergens)  # Debug logging
        
        analysis_result = identify_objects(base64_string, user_allergens)
        print("Analysis result:", analysis_result)  # Debug logging
        
        return jsonify(analysis_result)
            
    except Exception as e:
        print(f"Error in identify_item: {str(e)}")  # Add logging
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


def identify_objects(base64_image, user_allergens):
    load_dotenv()
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    # Format user allergens properly
    allergen_names = [a.get('name', '') for a in user_allergens if a.get('enabled', False)]
    allergen_list = ", ".join(allergen_names) if allergen_names else "none specified"
    
    system_prompt = f"""You are an expert at identifying food items and their potential allergens. 
    The user has specified the following allergens: {allergen_list}. Pay special attention to these allergens and their derivatives.
    
    Analyze the food image and respond with ONLY a JSON object containing:
    {{
        "food_name": "name of the food",
        "potential_allergens": ["allergen1", "allergen2"],
        "likely_ingredients": ["ingredient1", "ingredient2"],
        "confidence_level": "high/medium/low",
        "warnings": ["any important warnings", "cross-contamination risks", "derivative ingredient warnings"]
    }}"""

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
                        {"type": "text", "text": "What food item is this and what are its potential allergens?"},
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
        
        # Get the raw content and ensure proper error handling
        try:
            content = response.choices[0].message.content
            print("Raw OpenAI Response:", content)
            
            # Clean up the response
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            content = content.strip()
            
            # Parse JSON with better error handling
            try:
                result = json.loads(content)
                return {
                    "success": True,
                    "food_name": result.get("food_name", "Unknown Food"),
                    "potential_allergens": result.get("potential_allergens", []),
                    "likely_ingredients": result.get("likely_ingredients", []),
                    "confidence_level": result.get("confidence_level", "low"),
                    "warnings": result.get("warnings", ["No specific warnings"])
                }
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {str(e)}")
                print(f"Raw content: {content}")
                return {
                    "success": False,
                    "food_name": "Unknown Food",
                    "potential_allergens": [],
                    "likely_ingredients": [],
                    "confidence_level": "low",
                    "warnings": ["Unable to analyze image properly"]
                }
                
        except (AttributeError, IndexError) as e:
            print(f"Error processing OpenAI response: {str(e)}")
            return {
                "success": False,
                "food_name": "Error",
                "potential_allergens": [],
                "likely_ingredients": [],
                "confidence_level": "low",
                "warnings": ["Error processing API response"]
            }
            
    except Exception as e:
        print(f"OpenAI API error: {str(e)}")
        return {
            "success": False,
            "food_name": "Error",
            "potential_allergens": [],
            "likely_ingredients": [],
            "confidence_level": "low",
            "warnings": [f"Error analyzing image: {str(e)}"]
        }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)