from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import candidates, auth, dashboard, calls, jobs
import asyncio
from call_status_checker import check_call_status
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run the background task without blocking the main loop
    task = asyncio.create_task(check_call_status())
    yield
    # Clean up (if needed) - cancelling the task is good practice but optional for this simple script
    # task.cancel()

app = FastAPI(title="Dinodial API", lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://sayitdontpasteit.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Dinodial API"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["candidates"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(calls.router, prefix="/api/calls", tags=["calls"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
