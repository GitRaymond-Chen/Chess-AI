from flask import Flask, request, jsonify

app = Flask(__name__)

# Home route to test if the API is running
@app.route('/', methods=['GET'])
def home():
    return "API is running!"

# Example endpoint for user login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    return jsonify({"message": "Login successful", "user": data}), 200

# Example endpoint for game result submission
@app.route('/game-result', methods=['POST'])
def game_result():
    data = request.json
    return jsonify({"message": "Game result submitted", "result": data}), 200

# Example endpoint for bot training
@app.route('/train-bot', methods=['POST'])
def train_bot():
    data = request.json
    return jsonify({"message": "Bot training initiated"}), 200

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, port=5000)
