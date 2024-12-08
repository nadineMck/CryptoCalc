from flask import Flask, jsonify, request
from flask_cors import CORS
import polynomial
from polynomial import Polynomial
import time
from database import add_user_operation, list_operations_by_uuid

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


def getUUID():
    # replace with uuid from cookie
    uuid = "b632bc53-5a0e-4901-8ebd-f82e7f10f2e8"
    return uuid


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
        if mod.p == []:
            return jsonify({"result": "Specify modulo field from Parameters panel"})
        steps.append({"description": "Parse modulo polynomial", "value": str(mod)})
        polynomial1 = parseInputPolynomial(
            inputFormat, data.get("polynomial1", ""), mod
        )
        steps.append(
            {"description": "Parse polynomial 1 in field", "value": str(polynomial1)}
        )
        polynomial2 = parseInputPolynomial(
            inputFormat, data.get("polynomial2", ""), mod
        )
        steps.append(
            {"description": "Parse polynomial 2 in field", "value": str(polynomial2)}
        )

        result = doOperation(polynomial1, polynomial2, operation)
        result = getResult(outputFormat, result)

        uuid = getUUID()
        field = data.get("field", "GF(2⁸)")
        timestamp = data.get("timestamp", str(time.time()))

        steps.extend(
            [
                {
                    "description": replace_powers(step[0]),
                    "value": replace_powers(step[1]),
                }
                for step in polynomial.steps
            ]
        )
        val = str(result) if result else "0"
        add_user_operation(
            uuid,
            timestamp,
            operation,
            data.get("polynomial1", ""),
            data.get("polynomial2", ""),
            val,
            field,
            replace_powers(str(mod)),
            inputFormat,
            outputFormat,
        )
        return jsonify(
            {
                "result": str(result) if result else "0",
                "steps": steps,
                "timestamp": timestamp,
            }
        )
    except ValueError as e:
        return jsonify({"result": "Error: " + e.args[0]})


@app.route("/api/history", methods=["GET"])
def history():
    uuid = getUUID()
    history = list_operations_by_uuid(uuid)
    history = [
        {
            "id": i,
            "timestamp": item[2],
            "field": item[3],
            "irreduciblePolynomial": item[4],
            "operation": item[5],
            "input1": item[6],
            "input2": item[7],
            "result": item[8],
            "inputFormat": item[9],
            "outputFormat": item[10],
        }
        for i, item in enumerate(history)
    ]
    return jsonify(history)


if __name__ == "__main__":
    app.run(debug=True)
    """
    const historyData = [
        {
            id: 1,
            timestamp: new Date('2024-12-07T10:30:00'),
            field: 'GF(2⁸)',
            irreduciblePolynomial: 'x⁸ + x⁴ + x³ + x + 1',
            operation: 'add',
            input1: 'x^2 + x + 1',
            input2: 'x^3 + x',
            result: 'x^3 + x^2 + x + 1',
            inputFormat: 'polynomial',
            outputFormat: 'polynomial'
        },
        {
            id: 2,
            timestamp: new Date('2024-12-07T11:15:00'),
            field: 'GF(2⁴)',
            irreduciblePolynomial: 'x⁴ + x + 1',
            operation: 'multiply',
            input1: '1101',
            input2: '1011',
            result: '0111',
            inputFormat: 'binary',
            outputFormat: 'binary'
        }
    ];
    """
