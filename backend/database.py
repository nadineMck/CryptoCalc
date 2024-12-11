import psycopg2
from flask import flash

databaseName = "crypto"
db_user = "postgres.umvluanafdpwshcjysvf"
db_password = "lRxkLYo8ZsdRvAG3"
host = "aws-0-eu-central-1.pooler.supabase.com"
port = 5432


def connect():
    conn = psycopg2.connect(database=databaseName, user=db_user, password=db_password, host=host, port=port)
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
        flash("Error executing PostgresSQL query: " + str(e), "error")


def add_user_operation(username_hash, date_created, operation, input1, input2, result, field, irreducible_polynomial,
                       input_format, output_format, ):
    sql = """
    INSERT INTO User_Operations (
        username_hash, date_created, field, irreduciblePolynomial,
        operation, input1, input2, result, inputFormat, outputFormat
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        cur.execute(sql, (
            username_hash, date_created, field, irreducible_polynomial, operation, input1, input2, result, input_format,
            output_format,), )
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error adding user operation: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def remove_user_operation(username_hash, operation_id):
    sql = "DELETE FROM User_Operations WHERE username_hash = %s AND operation_id = %s"
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        cur.execute(sql, (username_hash, operation_id))
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error removing user operation: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def list_operations_by_username_hash(username_hash):
    sql = """
    SELECT * 
    FROM User_Operations
    WHERE username_hash = %s
    ORDER BY date_created DESC;
    """
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return None
        cur = conn.cursor()
        cur.execute(sql, (username_hash,))
        operations = cur.fetchall()
        return operations
    except psycopg2.Error as e:
        print(f"Error fetching operations for {username_hash}: {e}")
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def set_attribute(username_hash, operation_id, column, value):
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        sql = f"UPDATE User_Operations SET {column} = %s WHERE username_hash = %s AND operation_id = %s"
        cur.execute(sql, (value, username_hash, operation_id))
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error updating {column}: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_attribute(username_hash, operation_id, column):
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return None
        cur = conn.cursor()
        sql = f"SELECT {column} FROM User_Operations WHERE username_hash = %s AND operation_id = %s"
        cur.execute(sql, (username_hash, operation_id))
        result = cur.fetchone()
        return result[0] if result else None
    except psycopg2.Error as e:
        print(f"Error retrieving {column}: {e}")
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# Setters
def set_username_hash(username_hash, operation_id, new_username_hash):
    return set_attribute(username_hash, operation_id, "username_hash", new_username_hash)


def set_operation_id(username_hash, operation_id, new_operation_id):
    return set_attribute(username_hash, operation_id, "operation_id", new_operation_id)


def set_date_created(username_hash, operation_id, new_date_created):
    return set_attribute(username_hash, operation_id, "date_created", new_date_created)


def set_field(username_hash, operation_id, new_field):
    return set_attribute(username_hash, operation_id, "field", new_field)


def set_irreducible_polynomial(username_hash, operation_id, new_irreducible_polynomial):
    return set_attribute(username_hash, operation_id, "irreduciblePolynomial", new_irreducible_polynomial)


def set_operation(username_hash, operation_id, new_operation):
    return set_attribute(username_hash, operation_id, "operation", new_operation)


def set_input1(username_hash, operation_id, new_input1):
    return set_attribute(username_hash, operation_id, "input1", new_input1)


def set_input2(username_hash, operation_id, new_input2):
    return set_attribute(username_hash, operation_id, "input2", new_input2)


def set_result(username_hash, operation_id, new_result):
    return set_attribute(username_hash, operation_id, "result", new_result)


def set_input_format(username_hash, operation_id, new_input_format):
    return set_attribute(username_hash, operation_id, "inputFormat", new_input_format)


def set_output_format(username_hash, operation_id, new_output_format):
    return set_attribute(username_hash, operation_id, "outputFormat", new_output_format)


# Getters
def get_username_hash(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "username_hash")


def get_operation_id(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "operation_id")


def get_date_created(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "date_created")


def get_field(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "field")


def get_irreducible_polynomial(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "irreduciblePolynomial")


def get_operation(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "operation")


def get_input1(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "input1")


def get_input2(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "input2")


def get_result(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "result")


def get_input_format(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "inputFormat")


def get_output_format(username_hash, operation_id):
    return get_attribute(username_hash, operation_id, "outputFormat")


def add_user(username, username_hash, email, password, salt):
    sql = """
    INSERT INTO User_Auth (username, username_hash, email, password, salt)
    VALUES (%s, %s, %s, %s, %s)
    """
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        cur.execute(sql, (username, username_hash, email, password, salt))
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error adding user: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def remove_user(username_hash):
    sql_user = "DELETE FROM User_Auth WHERE username_hash = %s"
    sql_op = "DELETE FROM User_Operations WHERE username_hash = %s"
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        cur.execute(sql_user, (username_hash,))
        cur = conn.cursor()
        cur.execute(sql_op, (username_hash,))
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error removing user: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def authenticate_user(email, password):
    sql = "SELECT * FROM User_Auth WHERE email = %s AND password = %s"
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        cur.execute(sql, (email, password))
        user = cur.fetchone()
        return user
    except psycopg2.Error as e:
        print(f"Error authenticating user: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def find_user(username, email):
    sql = "SELECT username FROM User_Auth WHERE username = %s OR email = %s"
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return None
        cur = conn.cursor()
        cur.execute(sql, (username, email))
        user = cur.fetchone()
        return user is not None
    except psycopg2.Error as e:
        print(f"Error fetching user {username}: {e}")
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def validate_username_hash(username_hash):
    sql = "SELECT username FROM User_Auth WHERE username_hash = %s"
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return None
        cur = conn.cursor()
        cur.execute(sql, (username_hash,))
        user = cur.fetchone()
        return user
    except psycopg2.Error as e:
        print(f"Error fetching user {username_hash}: {e}")
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# Update user details
def update_user(username, new_email=None, new_password=None):
    if new_email and new_password:
        sql = "UPDATE User_Auth SET email = %s, password = %s WHERE username = %s"
    elif new_email:
        sql = "UPDATE User_Auth SET email = %s WHERE username = %s"
    elif new_password:
        sql = "UPDATE User_Auth SET password = %s WHERE username = %s"
    else:
        return
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return False
        cur = conn.cursor()
        if new_email and new_password:
            cur.execute(sql, (new_email, new_password, username))
        elif new_email:
            cur.execute(sql, (new_email, username))
        elif new_password:
            cur.execute(sql, (new_email, new_password, username))
        conn.commit()
        return True
    except psycopg2.Error as e:
        print(f"Error updating email for {username}: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_password_salt(email):
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return None
        cur = conn.cursor()
        sql = f"SELECT salt FROM User_Auth WHERE email = %s"
        cur.execute(sql, (email,))
        result = cur.fetchone()
        return result[0] if result else None
    except psycopg2.Error as e:
        print(f"Error retrieving salt: {e}")
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_user_details(username_hash):
    conn = None
    cur = None
    try:
        conn = connect()
        if not conn:
            return None
        cur = conn.cursor()
        sql = f"SELECT username, email FROM User_Auth WHERE username_hash = %s"
        cur.execute(sql, (username_hash,))
        result = cur.fetchone()
        return result
    except psycopg2.Error as e:
        print(f"Error retrieving salt: {e}")
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
