from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import requests
import os

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY', 'default-key-if-not-set')
PORT = os.environ.get('PORT', 3000)

@app.route("/", methods=['GET'])
def hello_world():
    return 'You can try this model by using this command directly in cmd or better ui with postman\n\n curl -X POST https://pmu-b-data-science-project.onrender.com/predict -H "Content-Type: application/json" -d "{\"text\":\"{TEXT HERE}\"}"\n\n Example\n curl -X POST https://pmu-b-data-science-project.onrender.com/predict -H "Content-Type: application/json" -d "{\"text\":\"hello I\'m feeling great today!\"}'
    

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        text = data.get('text')
        
        if not text:
            return jsonify({'message': 'No text provided for prediction.'}), 400
        
        # Simple check to see if text contains non-ASCII characters (assuming non-English)
        if any(ord(char) > 127 for char in text):
            # Set up your translation request
            translation_params = {
                'langpair': 'th|en',
                'q': text,
                'mt': '1',
                'onlyprivate': '0',
                'de': 'your-email@example.com'
            }
            headers = {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'translated-mymemory---translation-memory.p.rapidapi.com'
            }
            response = requests.get('https://translated-mymemory---translation-memory.p.rapidapi.com/get', 
                                    params=translation_params, headers=headers)
            if response.ok:
                text = response.json().get('responseData', {}).get('translatedText', text)

        # Rest of your prediction logic
        process = subprocess.Popen(['python', 'predict.py'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate(input=json.dumps({'text': text}).encode('utf-8'))
        
        if process.returncode == 0:
            return stdout.decode('utf-8')
        else:
            return jsonify({'message': 'Error during prediction.', 'error': stderr.decode('utf-8')}), 500

    except Exception as e:
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(PORT))
