from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)

database = client.dinodial

candidates_collection = database.get_collection("candidates")
calls_collection = database.get_collection("calls")
users_collection = database.get_collection("users")
jobs_collection = database.get_collection("jobs")
