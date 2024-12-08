from flask import Flask, jsonify, request
from flask_cors import CORS
from polynomial import Polynomial

app = Flask(__name__)

CORS(app)


def replace_powers(input_str):
    power_map = {
        " ** 0": "⁰",
        " ** 1": "¹",
        " ** 2": "²",
        " ** 3": "³",
        " ** 4": "⁴",
        " ** 5": "⁵",
        " ** 6": "⁶",
        " ** 7": "⁷",
        " ** 8": "⁸",
        " ** 9": "⁹",
    }
    for sup, norm in power_map.items():
        input_str = input_str.replace(sup, f"{norm}")

    return input_str


def replace_superscripts(input_str):
    superscript_map = {
        "⁰": "0",
        "¹": "1",
        "²": "2",
        "³": "3",
        "⁴": "4",
        "⁵": "5",
        "⁶": "6",
        "⁷": "7",
        "⁸": "8",
        "⁹": "9",
    }

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
        mod = parseInputPolynomial(modFormat, data.get("irreduciblePoly", ""))
        if mod.p == []:
            return jsonify({"result": "Specify modulo field from Parameters panel"})
        polynomial1 = parseInputPolynomial(inputFormat, data.get("polynomial1", ""), mod)
        polynomial2 = parseInputPolynomial(inputFormat, data.get("polynomial2", ""), mod)

        result = doOperation(polynomial1, polynomial2, operation)
        result = getResult(outputFormat, result)

        return jsonify({"result": str(result) if result else "0"})
    except ValueError as e:
        return jsonify({"result": "Error: " + e.args[0]})


if __name__ == "__main__":
    app.run(debug=True)
