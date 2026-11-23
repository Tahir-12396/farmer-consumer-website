import os
import pymysql

db_user = os.environ.get('MYSQL_USER', 'root')
db_password = os.environ.get('MYSQL_PASSWORD', 'shabber')
db_host = os.environ.get('MYSQL_HOST', '127.0.0.1')
db_name = os.environ.get('MYSQL_DB', 'kisandirect_db')

conn = pymysql.connect(host=db_host, user=db_user, password=db_password, database=db_name)
cursor = conn.cursor()
cursor.execute("SHOW COLUMNS FROM users LIKE 'email'")
col = cursor.fetchone()
if not col:
    cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(120) NULL UNIQUE AFTER mobile_number")
    print("Added email column to users table.")
else:
    print("email column already exists.")

# Update seed users with demo emails
cursor.execute("UPDATE users SET email='ramesh@farm.com' WHERE mobile_number='9876543210' AND (email IS NULL OR email='')")
cursor.execute("UPDATE users SET email='lakshmi@farm.com' WHERE mobile_number='9876543211' AND (email IS NULL OR email='')")
cursor.execute("UPDATE users SET email='suresh@farm.com' WHERE mobile_number='9876543212' AND (email IS NULL OR email='')")
cursor.execute("UPDATE users SET email='ananya@gmail.com' WHERE mobile_number='9123456780' AND (email IS NULL OR email='')")
cursor.execute("UPDATE users SET email='priya@gmail.com' WHERE mobile_number='9123456781' AND (email IS NULL OR email='')")

# Also make mobile_number nullable so users can register with ONLY email if they don't have mobile
cursor.execute("ALTER TABLE users MODIFY COLUMN mobile_number VARCHAR(20) NULL")

conn.commit()

cursor.execute("SELECT id, full_name, mobile_number, email, role FROM users")
for u in cursor.fetchall():
    print("User:", u)

conn.close()
