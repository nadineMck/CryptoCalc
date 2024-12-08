from flask import flash
from datetime import datetime
import psycopg2

databaseName = "crypto"


def connect():
    conn = psycopg2.connect(
        database=databaseName,
        user="postgres",
        password="12345678",
        host="127.0.0.1",
        port="5432",
    )
    return conn


def query_postgresql(sql, params=None, query=False):
    try:
        if params:
            conn = connect()
            cur = conn.cursor()
            cur.execute(sql, params)
            if not query:
                conn.commit()
                conn.close()
            else:
                rows = cur.fetchall()
                conn.close()
                return rows
        else:
            conn = connect()
            cur = conn.cursor()
            cur.execute(sql)
            rows = cur.fetchall()
            conn.close()
            return rows
    except psycopg2.Error as e:
        flash("Error executing PostgreSQL query: " + str(e), "error")


# add operation


def add_user_operation(
    uuid,
    date_created,
    operation,
    input1,
    input2,
    result,
    field,
    irreducible_polynomial,
    input_format,
    output_format,
):
    sql = """
    INSERT INTO User_Operations (
        uuid, date_created, field, irreduciblePolynomial,
        operation, input1, input2, result, inputFormat, outputFormat
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    conn = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        cur.execute(
            sql,
            (
                uuid,
                date_created,
                field,
                irreducible_polynomial,
                operation,
                input1,
                input2,
                result,
                input_format,
                output_format,
            ),
        )
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error adding user operation: {e}")
        return False
    finally:
        if conn:
            cur.close()
            conn.close()


def remove_user_operation(uuid, operation_id):
    sql = "DELETE FROM User_Operations WHERE uuid = %s AND operation_id = %s"
    conn = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        cur.execute(sql, (uuid, operation_id))
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error removing user operation: {e}")
        return False
    finally:
        if conn:
            cur.close()
            conn.close()


def list_operations_by_uuid(uuid):
    sql = """
    SELECT * 
    FROM User_Operations
    WHERE uuid = %s
    ORDER BY date_created DESC;
    """
    conn = None
    try:
        conn = connect()
        if not conn:
            return None
        cur = conn.cursor()
        cur.execute(sql, (uuid,))
        operations = cur.fetchall()
        return operations
    except psycopg2.Error as e:
        print(f"Error fetching operations for UUID {uuid}: {e}")
        return None
    finally:
        if conn:
            cur.close()
            conn.close()


# delete operation

# list operation of specific user, listed based on data (return list)


# setField

# setIrreduciblePolynomial
# setOperation
# setInput1
# setInput2
# setResult
# setInputFormat
# setOutputFormat

# getDate
# getField
# getIrreduciblePolynomial
# getOperation
# getInput1
# getInput2
# getResult
# getInputFormat
# getOutputFormat
# Function to Insert Data


def set_attribute(uuid, operation_id, column, value):
    conn = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        sql = f"UPDATE User_Operations SET {column} = %s WHERE uuid = %s AND operation_id = %s"
        cur.execute(sql, (value, uuid, operation_id))
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error updating {column}: {e}")
        return False
    finally:
        if conn:
            cur.close()
            conn.close()


def get_attribute(uuid, operation_id, column):
    conn = None
    try:
        conn = connect()
        if not conn:
            return None
        cur = conn.cursor()
        sql = f"SELECT {column} FROM User_Operations WHERE uuid = %s AND operation_id = %s"
        cur.execute(sql, (uuid, operation_id))
        result = cur.fetchone()
        return result[0] if result else None
    except psycopg2.Error as e:
        print(f"Error retrieving {column}: {e}")
        return None
    finally:
        if conn:
            cur.close()
            conn.close()


# Setters
def set_uuid(uuid, operation_id, new_uuid):
    return set_attribute(uuid, operation_id, "uuid", new_uuid)


def set_operation_id(uuid, operation_id, new_operation_id):
    return set_attribute(uuid, operation_id, "operation_id", new_operation_id)


def set_date_created(uuid, operation_id, new_date_created):
    return set_attribute(uuid, operation_id, "date_created", new_date_created)


def set_field(uuid, operation_id, new_field):
    return set_attribute(uuid, operation_id, "field", new_field)


def set_irreducible_polynomial(uuid, operation_id, new_irreducible_polynomial):
    return set_attribute(
        uuid, operation_id, "irreduciblePolynomial", new_irreducible_polynomial
    )


def set_operation(uuid, operation_id, new_operation):
    return set_attribute(uuid, operation_id, "operation", new_operation)


def set_input1(uuid, operation_id, new_input1):
    return set_attribute(uuid, operation_id, "input1", new_input1)


def set_input2(uuid, operation_id, new_input2):
    return set_attribute(uuid, operation_id, "input2", new_input2)


def set_result(uuid, operation_id, new_result):
    return set_attribute(uuid, operation_id, "result", new_result)


def set_input_format(uuid, operation_id, new_input_format):
    return set_attribute(uuid, operation_id, "inputFormat", new_input_format)


def set_output_format(uuid, operation_id, new_output_format):
    return set_attribute(uuid, operation_id, "outputFormat", new_output_format)


# Getters
def get_uuid(uuid, operation_id):
    return get_attribute(uuid, operation_id, "uuid")


def get_operation_id(uuid, operation_id):
    return get_attribute(uuid, operation_id, "operation_id")


def get_date_created(uuid, operation_id):
    return get_attribute(uuid, operation_id, "date_created")


def get_field(uuid, operation_id):
    return get_attribute(uuid, operation_id, "field")


def get_irreducible_polynomial(uuid, operation_id):
    return get_attribute(uuid, operation_id, "irreduciblePolynomial")


def get_operation(uuid, operation_id):
    return get_attribute(uuid, operation_id, "operation")


def get_input1(uuid, operation_id):
    return get_attribute(uuid, operation_id, "input1")


def get_input2(uuid, operation_id):
    return get_attribute(uuid, operation_id, "input2")


def get_result(uuid, operation_id):
    return get_attribute(uuid, operation_id, "result")


def get_input_format(uuid, operation_id):
    return get_attribute(uuid, operation_id, "inputFormat")


def get_output_format(uuid, operation_id):
    return get_attribute(uuid, operation_id, "outputFormat")
