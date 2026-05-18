import json

def transform_gita_data():
    # Load the full Gita data
    with open('/home/hitesh/hit/bhagvatgita/full_gita.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Transform each verse
    transformed_verses = []
    
    for verse in data['verses']:
        transformed_verse = {
            "chapter": verse["chapter"],
            "verse": verse["verse"],
            "reference": f"Bhagavad Gita {verse['chapter']}.{verse['verse']}",
            "sanskrit": verse["sanskrit"],
            "translation": verse["english"],
            "meaning": verse["english"],  # Using translation as meaning for now
            "tags": [],  # Will need to be populated based on content analysis
            "keywords": [],  # Will need to be populated based on content analysis
            "translation_hi": "",  # Not available in source data
            "meaning_hi": "",  # Not available in source data
            "sanskrit_hi": ""  # Not available in source data
        }
        transformed_verses.append(transformed_verse)
    
    # Create the final structure
    transformed_data = {
        "verses": transformed_verses
    }
    
    # Save to new file
    with open('/home/hitesh/hit/bhagvatgita/backend_new/verses.json', 'w', encoding='utf-8') as f:
        json.dump(transformed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Transformed {len(transformed_verses)} verses")

if __name__ == "__main__":
    transform_gita_data()