import sqlite3

conn = None
try:
    print('getting')
    conn = sqlite3.connect('database.sqlite3')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print(cursor.fetchall())
except:
    print('oh')
