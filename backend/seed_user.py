import asyncio
from database import users_collection
from security import get_password_hash
from models import UserInDB
import os
from dotenv import load_dotenv

load_dotenv()

async def seed_user():
    print("Seeding initial user...")
    username = "admin"
    password = "password123"
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"username": username})
    if existing_user:
        print(f"User '{username}' already exists.")
        return

    hashed_password = get_password_hash(password)
    new_user = UserInDB(username=username, password=password, password_hash=hashed_password)
    
    await users_collection.insert_one(new_user.model_dump())
    print(f"User '{username}' created successfully with password '{password}'.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(seed_user())
