import pyodbc
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Database credentials from .env
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")

if not all([DB_SERVER, DB_NAME, DB_USERNAME, DB_PASSWORD]):
    raise EnvironmentError("Missing database configuration in .env file.")

# Establish the connection
conn = pyodbc.connect(
    f"DRIVER={{{DB_DRIVER}}};"
    f"SERVER={DB_SERVER};"
    f"DATABASE={DB_NAME};"
    f"UID={DB_USERNAME};"
    f"PWD={DB_PASSWORD}"
)
cursor = conn.cursor()

# Create Users table with elo column
cursor.execute("""
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    elo INT DEFAULT 1500 NOT NULL
)
ELSE
IF NOT EXISTS (SELECT * FROM syscolumns WHERE id=OBJECT_ID('Users') AND name='elo')
ALTER TABLE Users ADD elo INT DEFAULT 1500 NOT NULL
""")
print("Users table ensured with elo column.")
conn.commit()

# Create Games table (if not already created)
cursor.execute("""
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Games' AND xtype='U')
CREATE TABLE Games (
    game_id INT IDENTITY(1,1) PRIMARY KEY,
    player1ID INT NOT NULL,
    player2ID VARCHAR(50) NOT NULL, -- Can be a user ID or bot ID (e.g., 'bot1')
    game_data TEXT NOT NULL,
    created_at VARCHAR(20) NOT NULL,
    FOREIGN KEY (player1ID) REFERENCES Users(id)
)
""")
print("Games table ensured.")
conn.commit()

# Create Bots table
cursor.execute("""
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Bots' AND xtype='U')
CREATE TABLE Bots (
    bot_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    user_id INT DEFAULT 0 NOT NULL
)
""")
print("Bots table ensured.")
conn.commit()

# Close the connection
conn.close()
print("Connection closed.")