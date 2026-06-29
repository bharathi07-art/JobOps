import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from "../config/prisma";

const googleClientID = process.env.GOOGLE_CLIENT_ID || process.env.googleClientID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.googleClientSecret;
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || process.env.googleCallbackURL || "http://localhost:5000/api/auth/google/callback";

if (!googleClientID || !googleClientSecret) {
  console.warn('⚠️ Google OAuth requires client ID and client secret. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment. Using dummy values for testing.');
}

const finalGoogleClientID = googleClientID || "dummy_client_id";
const finalGoogleClientSecret = googleClientSecret || "dummy_client_secret";

passport.use(new GoogleStrategy(
  {
    clientID: finalGoogleClientID,
    clientSecret: finalGoogleClientSecret,
    callbackURL: googleCallbackURL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error("Google profile has no email"));
      }

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: profile.displayName,
            email,
            password: "",
            googleID: profile.id,
            avatar: profile.photos?.[0]?.value || "",
          },
        });
      }

      return done(null, user);
    } catch (error) {
      done(error as Error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id: string | number, done) => {
  try {
    const userId = typeof id === "string" ? Number(id) : id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    done(null, user);
  } catch (error) {
    done(error as Error);
  }
});

export default passport;