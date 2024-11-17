import os
import openai
from dotenv import load_dotenv


def identify_objects(base64_image):
    load_dotenv()
    openai.api_key = os.getenv("OPENAI_API_KEY")
    prompt = """Identify the foods in the image and return the name of the foods in alphabetical order being as specific as possible. Begin with a capital letter and make the rest of the letters lowercase for each food item and only use letters. If the image contains multiple foods, respond with the food name in singular form. If the image contains a beverage and it has a sticker label, respond with the brand name and flavor given on the label. For each different item, respond with the name on a new line. For the same item, separate words with a space and don't make a new line. For meat and fish, be as specific as possible about the type of animal it is from. For spices, be specific about the name of the spices. If no food is detected in the image, respond with 'no food detected'."""
  
    client = openai.OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """You are an expert at identifying foods which are the primary focus with clarity. Identify the food and return the name of the fruits. Keep your response limited to just the name of the food."""
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": base64_image}},
                ],
            }
        ],
    )
    object_name = response.choices[0].message.content
    return object_name


# Test URL (replace with a real image URL)
image_url = "https://www.eatthis.com/wp-content/uploads/sites/4/2021/06/popular-beers-taste-test.jpg?quality=82&strip=all"

# Call the function
raw_result = identify_objects(image_url)

# Transform the raw_result into a list separated by commas
if raw_result:
    # Split the result by commas, trim whitespace, and store in a list
    list_result = [item.strip() for item in raw_result.replace('\n', ',').split(',') if item.strip()]
    print("List Result:", list_result)
else:
    print("Failed to identify objects.")