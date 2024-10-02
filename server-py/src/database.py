from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from dotenv import load_dotenv
import urllib.parse
import os

load_dotenv()

#------------------ Settings MongoDB database ---------------------------------
username = urllib.parse.quote_plus(os.environ.get("MONGO_USERNAME"))
password = urllib.parse.quote_plus(os.environ.get("MONGO_PASSWORD"))

# Set the database URL using environment variables
DB_URL = f"mongodb+srv://{username}:{password}@development.wv246.mongodb.net/?retryWrites=true&w=majority&appName=Development"

#------------------------Development---------------------------
#DB_URL = os.environ.get("DB_URL", "mongodb://localhost:27017")
#--------------------------------------------------------------

client = AsyncIOMotorClient(DB_URL)
db = client["Blood-Scanner"]
users_collection = db['users']
images_collection = db['images.files']
#fs = AsyncIOMotorGridFSBucket(db)
image_fs = AsyncIOMotorGridFSBucket(db, bucket_name='images')
#--------------------------------------------------------------