import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="healthy_meals_db",
        user="postgres",
        password= os.getenv("password"),
        port="5432",
        cursor_factory=RealDictCursor
    )
    return conn