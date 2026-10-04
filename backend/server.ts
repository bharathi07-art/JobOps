// Load .env using an absolute path anchored to this file's directory.
// This ensures the correct .env is found regardless of which directory
// nodemon / ts-node is launched from (fixes "injected env (0)" on Windows).
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { validateEnv } from './config/validateEnv';
validateEnv();

import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import connDB from "./config/mDB";
import cookieParser from 'cookie-parser';
import session from 'express-session';

import passport from 'passport';
import './config/passport';
import './config/passportGithub';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import aiRoutes from "./routes/aiRoutes";
import chatRoutes from "./routes/chatRoutes";
import adminRoutes from "./routes/adminRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import emailAutomationRoutes from "./routes/emailAutomationRoutes";
import accountDeletionRoutes from "./routes/accountDeletionRoutes";
import logoutRoute from "./routes/logoutRoute";
import { startEmailAutomationScheduler } from "./scheduler/emailAutomationScheduler";
import { runPermanentDeletionJob } from "./services/accountDeletionService";

const app = express();
export default app;



app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // In development, allow any origin (for port forwarding / mobile testing)
    callback(null, origin);
  },
  credentials: true}
));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'jobopssecret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobresult", aiRoutes);
app.use("/api/ai", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/email-automation", emailAutomationRoutes);
app.use("/api/account", accountDeletionRoutes);
app.use('/logout', logoutRoute);


// 404 catch-all for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Not found" });
});


const port: number = Number(process.env.PORT) || 5000;

function startServer() {
  connDB().then(() => {
    // Start background email automation after Mongo is connected
    startEmailAutomationScheduler();

    // Run permanent deletion job every 6 hours
    setInterval(() => {
      runPermanentDeletionJob().catch(err => console.error('Permanent deletion job failed:', err));
    }, 6 * 60 * 60 * 1000);

    app.listen(port,'0.0.0.0', () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  });
}

// Only start the server when this file is run directly (not imported by tests)
if (require.main === module) {
  startServer();
}
