import openai
import os
from dotenv import load_dotenv
from flask import request, jsonify
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import certifi
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Add MongoDB connection setup
def get_db_connection():
    client = MongoClient(os.getenv('MONGODB_URI'), tlsCAFile=certifi.where())
    return client['food_database']

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
    
    # Connect to database
    db = get_db_connection()
    food_collection = db['food_items']
    
    # Retrieve similar food items from database
    similar_items = retrieve_similar_items(food_collection, user_allergens)
    
    # Format context from similar items
    context = format_context_from_similar_items(similar_items)
    print(f"Formatted context length: {len(context)} characters")
    print("Sample context:", context[:200] + "..." if len(context) > 200 else context)
    
    # Format user allergens properly
    allergen_names = [a.get('name', '') for a in user_allergens if a.get('enabled', False)]
    allergen_list = ", ".join(allergen_names) if allergen_names else "none specified"
    
    system_prompt = f"""You are an expert at identifying food items and their potential allergens.
    The user has specified the following allergens: {allergen_list}. 
    
    Previous similar food analyses for reference:
    {context}
    
    Analyze the food image and respond with ONLY a JSON object containing:
    {{
        "food_name": "name of the food",
        "potential_allergens": ["allergen1", "allergen2"],
        "likely_ingredients": ["ingredient1", "ingredient2"],
        "confidence_level": "high/medium/low",
        "warnings": ["any important warnings"]
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
                result = {
                    "success": True,
                    "food_name": result.get("food_name", "Unknown Food"),
                    "potential_allergens": result.get("potential_allergens", []),
                    "likely_ingredients": result.get("likely_ingredients", []),
                    "confidence_level": result.get("confidence_level", "low"),
                    "warnings": result.get("warnings", ["No specific warnings"])
                }
                
                # Store the result in database here, inside the try block
                store_food_analysis(food_collection, result, user_allergens)
                
                return result
                
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

def retrieve_similar_items(collection, user_allergens):
    start_time = datetime.now()
    
    allergen_names = [a.get('name', '') for a in user_allergens if a.get('enabled', False)]
    
    # Query items with similar allergens
    similar_items = collection.find({
        "potential_allergens": {
            "$in": allergen_names
        }
    }).limit(5)
    
    results = list(similar_items)
    retrieval_time = (datetime.now() - start_time).total_seconds()
    
    print(f"RAG Metrics:")
    print(f"- Retrieval time: {retrieval_time:.2f} seconds")
    print(f"- Retrieved documents: {len(results)}")
    print(f"- Matching allergens: {allergen_names}")
    
    return results

def format_context_from_similar_items(similar_items):
    """Format retrieved items into context string"""
    context_entries = []
    for item in similar_items:
        context_entries.append(
            f"Food: {item['food_name']}\n"
            f"Allergens: {', '.join(item['potential_allergens'])}\n"
            f"Warnings: {', '.join(item['warnings'])}"
        )
    return "\n\n".join(context_entries)

def store_food_analysis(collection, analysis_result, user_allergens):
    """Store food analysis in database"""
    document = {
        "user_allergens": [a.get('name', '') for a in user_allergens if a.get('enabled', False)],
        "food_name": analysis_result["food_name"],
        "potential_allergens": analysis_result["potential_allergens"],
        "likely_ingredients": analysis_result["likely_ingredients"],
        "confidence_level": analysis_result["confidence_level"],
        "warnings": analysis_result["warnings"],
        "timestamp": datetime.now()
    }
    
    try:
        result = collection.insert_one(document)
        print(f"Successfully stored food analysis with ID: {result.inserted_id}")
        print(f"Stored document: {document}")
        return True
    except Exception as e:
        print(f"Error storing food analysis: {str(e)}")
        print(f"Failed document: {document}")
        return False

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)