import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export default async function connDB(){
        try{
            const uri = process.env.DB_URI;
            if (!uri) {
                throw new Error('Missing DB_URI environment variable. Please add it to your .env file.');
            }
            const conn = await mongoose.connect(uri);
            console.log(`MongoDB connected: ${conn.connection.host}`);
        }catch(err: unknown){
            console.error(`MongoDB connection error:`, err)
            process.exit(1);
        }

}