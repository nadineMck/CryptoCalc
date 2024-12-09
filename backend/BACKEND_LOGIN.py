from flask import Flask, request, jsonify
import hashlib
import os
import uuid
import re
from database import query_postgresql, connect

app = Flask(__name__)

def hash_password(password, salt=None):
    if not salt:
        salt = os.urandom(16).hex()
    salted_password = password + salt
    hashed_password = hashlib.sha256(salted_password.encode()).hexdigest()
    return hashed_password, salt

def is_password_strong(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must include at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must include at least one lowercase letter."
    if not re.search(r"\d", password):
        return False, "Password must include at least one number."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must include at least one special character."
    return True, "Password is strong."

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = connect()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Users WHERE username = %s", (username,))
    user_exists = cur.fetchone()

    if user_exists:
        return jsonify({"error": "Username already exists."}), 400
    
    is_strong, message = is_password_strong(password)
    if not is_strong:
        return jsonify({"error": message}), 400

    hashed_password, salt = hash_password(password)
    user_id = str(uuid.uuid4())
    cur.execute(
        "INSERT INTO Users (id, username, password, salt) VALUES (%s, %s, %s, %s)",
        (user_id, username, hashed_password, salt)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Account created successfully."}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = connect()
    cur = conn.cursor()
    cur.execute("SELECT id, password, salt FROM Users WHERE username = %s", (username,))
    user = cur.fetchone()

    if not user:
        return jsonify({"error": "Username not found."}), 400

    user_id, hashed_password, salt = user
    entered_hash, _ = hash_password(password, salt)

    if hashed_password == entered_hash:
        return jsonify({"message": "Login successful.", "user_id": user_id}), 200
    else:
        return jsonify({"error": "Invalid username or password."}), 401

if __name__ == '__main__':
    app.run(debug=True)
