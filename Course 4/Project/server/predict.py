import sys
import pickle
import json

# Load the vectorizer and model from .pkl files
with open('suicide_vectorizer.pkl', 'rb') as file:
    vectorizer = pickle.load(file)

with open('suicide_model.pkl', 'rb') as file:
    model = pickle.load(file)

# Function to preprocess, vectorize, and predict the text
def predict(text):
    # Preprocessing steps would go here (if not already applied before vectorization)
    
    # Vectorize the text using the loaded vectorizer
    text_vector = vectorizer.transform([text])
    
    # Predict with the loaded model
    prediction = model.predict(text_vector)
    return int(prediction[0])  # Convert numpy int64 to standard int

# Read the input from stdin
input_data = json.loads(sys.stdin.read())

# Make a prediction
result = predict(input_data['text'])

# Write the prediction to stdout
if result == 0:
    sys.stdout.write(json.dumps({'prediction': "non-suicide"}))
else:
    sys.stdout.write(json.dumps({'prediction': "suicide"}))
    
