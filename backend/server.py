import time

from flask import Flask, jsonify, url_for, request
from flask_cors import CORS
from flask_mail import Mail, Message
import secrets
import polynomial
from auth import hash_password, is_password_strong
from database import (update_user_password, add_user, authenticate_user, add_user_operation,
                      list_operations_by_username_hash, find_user,
                      get_password_salt, validate_username_hash, get_user_details, remove_user, find_email)
from polynomial import Polynomial

app = Flask(__name__)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 't3067272@gmail.com'
app.config['MAIL_PASSWORD'] = 'mlkn suou dcoe nand'
app.secret_key = "sample_key"
mail = Mail(app)
CORS(app, supports_credentials=True)
tokens = {}


# Password Reset Request Route
@app.route('/reset', methods=['GET', 'POST'])
def request_reset():
    if request.method == 'POST':
        data = request.get_json()
        email = data['email']

        if not find_email(email):
            return jsonify({'message': "This email is not registered", "reset": False})

        token = secrets.token_urlsafe(16)
        tokens[email] = token

        reset_url = url_for('reset_with_token', token=token, _external=True)

        msg = Message(
            "CryptoCalc - Password Reset Request",
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        msg.body = f"Click the link to reset your password: {reset_url}"
        mail.send(msg)
    return jsonify({"message": "Check your email for a password reset link", "reset": True})


# Password Reset with Token Route
@app.route('/reset/<token>', methods=['GET', 'POST'])
def reset_with_token(token):
    email = next((email for email, t in tokens.items() if t == token), None)
    if not email:
        return jsonify({"message": "Invalid or expired token!", "reset": False})
    if request.method == 'POST':
        data = request.get_json()
        new_password = data['password']
        pass_valid, msg = is_password_strong(new_password)
        if not pass_valid:
            return jsonify({"message": "Password does not meet complexity requirements: " + msg, "reset": False})
        hashed_password, salt = hash_password(data['password'])
        update_user_password(email, hashed_password, salt)
        user = authenticate_user(email, hashed_password)
        del tokens[email]
        return jsonify({"message": "Password has been reset successfully!", "reset": True, "email": email,
                        "username": user[0], "username_hash": user[1]})
    return jsonify({"message": "Invalid or expired token!", "reset": False})


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Username, email, and password are required", "signup": False})

    username = data['username']
    email = data['email']
    if find_user(username, email):
        return jsonify({"message": "User already exists!"})
    password = data['password']
    pass_valid, msg = is_password_strong(password)
    if not pass_valid:
        return jsonify({"message": "Password does not meet complexity requirements: " + msg, "signup": False})

    hashed_password, salt = hash_password(data['password'])
    hashed_username, _ = hash_password(username)
    user_added = add_user(username, hashed_username, email, hashed_password, salt)

    if user_added:
        return jsonify({"message": "Signup successful", "signup": True, "username_hash": hashed_username})
    else:
        return jsonify({"message": "A database error occurred", "signup": False})


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"})

    email = data['email']
    password = data['password']
    salt = get_password_salt(email)
    if salt is not None:
        hashed_password, _ = hash_password(password, salt)
        user = authenticate_user(email, hashed_password)
        if user:
            return jsonify({"message": "Login successful.", "authenticated": True,
                            "username": user[0], "username_hash": user[1]})
        else:
            return jsonify({"message": "Invalid email or password.", "authenticated": False})
    else:
        return jsonify({"message": "Invalid email or password.", "authenticated": False})


@app.route('/cookie', methods=['POST'])
def cookie():
    username_hash = request.get_json().get("username_hash", "")
    if validate_username_hash(username_hash):
        return jsonify({"authenticated": True})
    else:
        return jsonify({"authenticated": False})


@app.route('/delete_user', methods=['POST'])
def delete_user():
    username_hash = request.get_json().get("username_hash", "")
    return jsonify({"success": remove_user(username_hash)})


@app.route('/user_details', methods=['POST'])
def user_details():
    username_hash = request.get_json().get("username_hash", "")
    details = get_user_details(username_hash)
    if details:
        username, email = details
        return jsonify({"username": username, "email": email})
    return jsonify({})


def replace_powers(input_str):
    power_map = {" ** 0": "⁰", " ** 1": "¹", " ** 2": "²", " ** 3": "³", " ** 4": "⁴", " ** 5": "⁵", " ** 6": "⁶",
                 " ** 7": "⁷", " ** 8": "⁸", " ** 9": "⁹", }
    for sup, norm in power_map.items():
        input_str = input_str.replace(sup, f"{norm}")

    return input_str


def replace_superscripts(input_str):
    superscript_map = {"⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8",
                       "⁹": "9", }

    for sup, norm in superscript_map.items():
        input_str = input_str.replace(sup, f"**{norm}")

    return input_str


def parseInputPolynomial(inputFormat, p, mod=None):
    if inputFormat == "binary":
        if mod:
            return Polynomial(b=p, mod=mod)
        else:
            return Polynomial(b=p)
    elif inputFormat == "hexadecimal":
        if mod:
            return Polynomial(bin(int(p, 16)), mod=mod)
        else:
            return Polynomial(bin(int(p, 16)))
    elif inputFormat == "polynomial":
        if mod:
            return Polynomial(s=replace_superscripts(p), mod=mod)
        else:
            return Polynomial(s=replace_superscripts(p))
    else:
        raise ValueError("Unknown input format")


def doOperation(poly1, poly2, op):
    if op == "add":
        return poly1 + poly2
    elif op == "subtract":
        return poly1 - poly2
    elif op == "multiply":
        return poly1 * poly2
    elif op == "divide":
        return poly1 / poly2
    elif op == "modulo":
        return poly1 % poly2
    elif op == "inverse":
        return ~poly1
    else:
        raise ValueError("Unknown operation")


def getResult(outputFormat, p):
    if outputFormat == "binary":
        return p.bin()
    elif outputFormat == "hexadecimal":
        return hex(p)
    elif outputFormat == "polynomial":
        return replace_powers(str(p))
    else:
        raise ValueError("Unknown output format")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    try:
        operation = data.get("operation", "add")
        inputFormat = data.get("inputFormat", "polynomial")
        outputFormat = data.get("outputFormat", "polynomial")
        modFormat = data.get("irreduciblePolyFormat", "polynomial")
        steps = []
        polynomial.steps = []
        mod = parseInputPolynomial(modFormat, data.get("irreduciblePoly", ""))
        if not mod.p:
            return jsonify({"result": "Specify modulo field from Parameters panel"})
        steps.append({"description": "Parse modulo polynomial", "value": str(mod)})
        polynomial1 = parseInputPolynomial(inputFormat, data.get("polynomial1", ""), mod)
        steps.append({"description": "Parse polynomial 1 in field", "value": str(polynomial1)})
        polynomial2 = parseInputPolynomial(inputFormat, data.get("polynomial2", ""), mod)
        steps.append({"description": "Parse polynomial 2 in field", "value": str(polynomial2)})

        result = doOperation(polynomial1, polynomial2, operation)
        result = getResult(outputFormat, result)

        username_hash = data.get("username_hash", "")
        field = data.get("field", "GF(2⁸)")
        timestamp = data.get("timestamp", str(time.time()))

        steps.extend(
            [{"description": replace_powers(step[0]), "value": replace_powers(step[1]), } for step in polynomial.steps])
        val = str(result) if result else "0"
        add_user_operation(username_hash, timestamp, operation, data.get("polynomial1", ""),
                           data.get("polynomial2", ""), val, field, replace_powers(str(mod)), inputFormat,
                           outputFormat, )
        return jsonify({"result": str(result) if result else "0", "steps": steps, "timestamp": timestamp, })
    except ValueError as e:
        return jsonify({"result": "Error: " + e.args[0]})


@app.route("/api/history", methods=["POST"])
def history():
    username_hash = request.get_json().get("username_hash", "")
    user_history = list_operations_by_username_hash(username_hash)
    user_history = [
        {"id": i, "timestamp": item[2], "field": item[3], "irreduciblePolynomial": item[4], "operation": item[5],
         "input1": item[6], "input2": item[7], "result": item[8], "inputFormat": item[9], "outputFormat": item[10], }
        for i, item in enumerate(user_history)]
    return jsonify(user_history)


if __name__ == "__main__":
    app.run(debug=True)
