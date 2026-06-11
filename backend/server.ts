import 'dotenv/config';
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
import subscriptionRoutes from "./routes/subscriptionRoutes";
import emailAutomationRoutes from "./routes/emailAutomationRoutes";
import accountDeletionRoutes from "./routes/accountDeletionRoutes";
import logoutRoute from "./routes/logoutRoute";
import { startEmailAutomationScheduler } from "./scheduler/emailAutomationScheduler";
import { runPermanentDeletionJob } from "./services/accountDeletionService";
import payment from "./routes/PaymentRoutes";

const app = express();



app.use(cors({
  origin: "http://localhost:5173",
  credentials: true}
));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use(
  session({
    secret: "jobopssecret",
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
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/email-automation", emailAutomationRoutes);
app.use("/api/account", accountDeletionRoutes);
app.use('/logout', logoutRoute);

app.use("/api/payment", payment)


const port: number = Number(process.env.PORT) || 5000;

connDB().then(() => {
  // Start background email automation after Mongo is connected
  startEmailAutomationScheduler();

  // Run permanent deletion job every 6 hours
  setInterval(() => {
    runPermanentDeletionJob().catch(err => console.error('Permanent deletion job failed:', err));
  }, 6 * 60 * 60 * 1000);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
