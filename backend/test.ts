// Temporarily paste your Atlas link directly here to bypass the .env reading bug:
import mongoose from 'mongoose'
const mongoURI= "mongodb+srv://07bharathis_db_user:bharathi07@cluster0.ttgeab8.mongodb.net/?appName=Cluster0"

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch(err => console.error("MongoDB connection error:", err));