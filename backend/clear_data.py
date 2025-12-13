"""
Script to clear all data from MongoDB collections
Run this to reset the database for testing/demo
"""
import asyncio
from database import candidates_collection, calls_collection, jobs_collection, users_collection

async def clear_all_data():
    """Clear all data from all collections"""
    print("⚠️  WARNING: This will delete ALL data from the database!")
    confirm = input("Type 'YES' to confirm: ")
    
    if confirm != "YES":
        print("❌ Aborted. No data was deleted.")
        return
    
    print("\n🗑️  Clearing data...")
    
    # Delete all candidates
    result = await candidates_collection.delete_many({})
    print(f"✅ Deleted {result.deleted_count} candidates")
    
    # Delete all calls
    result = await calls_collection.delete_many({})
    print(f"✅ Deleted {result.deleted_count} calls")
    
    # Delete all jobs
    result = await jobs_collection.delete_many({})
    print(f"✅ Deleted {result.deleted_count} jobs")
    
    print("\n✨ Database cleared successfully!")
    print("Note: User accounts were NOT deleted (you can still login)")

async def clear_calls_only():
    """Clear only call history, keep candidates"""
    print("🗑️  Clearing call history only...")
    result = await calls_collection.delete_many({})
    print(f"✅ Deleted {result.deleted_count} calls")
    
    # Reset candidate screening status
    result = await candidates_collection.update_many(
        {},
        {
            "$unset": {
                "screening_status": "",
                "last_call_outcome": "",
                "last_match_score": ""
            }
        }
    )
    print(f"✅ Reset screening status for {result.modified_count} candidates")
    print("✨ Call history cleared!")

async def clear_candidates_only():
    """Clear only candidates and their calls"""
    print("🗑️  Clearing candidates and their calls...")
    
    result = await candidates_collection.delete_many({})
    print(f"✅ Deleted {result.deleted_count} candidates")
    
    result = await calls_collection.delete_many({})
    print(f"✅ Deleted {result.deleted_count} calls")
    
    print("✨ Candidates and calls cleared!")

async def main():
    print("=" * 50)
    print("📊 Database Cleanup Tool")
    print("=" * 50)
    print("\nChoose an option:")
    print("1. Clear ALL data (candidates, calls, jobs)")
    print("2. Clear call history only (keep candidates)")
    print("3. Clear candidates and calls only (keep jobs)")
    print("4. Cancel")
    
    choice = input("\nEnter your choice (1-4): ")
    
    if choice == "1":
        await clear_all_data()
    elif choice == "2":
        await clear_calls_only()
    elif choice == "3":
        await clear_candidates_only()
    elif choice == "4":
        print("❌ Cancelled. No changes made.")
    else:
        print("❌ Invalid choice. No changes made.")

if __name__ == "__main__":
    asyncio.run(main())
