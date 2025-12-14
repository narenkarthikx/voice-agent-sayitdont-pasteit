import asyncio
from database import candidates_collection, jobs_collection, calls_collection

async def clear_database():
    """Clear all data from database collections"""
    print("Clearing database...")
    
    c1 = await candidates_collection.delete_many({})
    c2 = await jobs_collection.delete_many({})
    c3 = await calls_collection.delete_many({})
    
    print(f"✅ Deleted {c1.deleted_count} candidates")
    print(f"✅ Deleted {c2.deleted_count} jobs")
    print(f"✅ Deleted {c3.deleted_count} calls")
    print("\n✅ Database cleared successfully!")

if __name__ == "__main__":
    asyncio.run(clear_database())
