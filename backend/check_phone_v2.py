
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

async def main():
    mongo_uri = os.getenv('MONGO_DETAILS', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_uri)
    db = client.dinodial
    print(f"Checking candidate 693e46d4fe9dc99bc2900633...")
    try:
        candidate = await db.candidates.find_one({'_id': ObjectId('693e46d4fe9dc99bc2900633')})
        if candidate:
            print(f"Phone: '{candidate.get('phone')}'")
        else:
            print("Candidate Not Found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
