import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from '../config/prisma';

const githubClientID = process.env.GITHUB_CLIENT_ID || process.env.GithubClientID || process.env.clientID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.GithubClientSecret || process.env.clientSecret;
const githubCallbackURL = process.env.GITHUB_CALLBACK_URL || process.env.GithubCallbackURL || process.env.callbackURL || 'http://localhost:5000/api/auth/github/callback';

if (!githubClientID || !githubClientSecret) {
  console.warn('⚠️ GitHub OAuth requires client ID and client secret. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your environment. Using dummy values for testing.');
}

const finalGithubClientID = githubClientID || "dummy_client_id";
const finalGithubClientSecret = githubClientSecret || "dummy_client_secret";

passport.use(new GitHubStrategy(
  {
    clientID: finalGithubClientID,
    clientSecret: finalGithubClientSecret,
    callbackURL: githubCallbackURL,
    scope: ['user:email'],
  },
  async (accessToken:string, refreshToken:string, profile:any, done:any)=> {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('GitHub profile has no email'));
      }

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: profile.displayName || profile.username || 'GitHub User',
            email,
            password: '',
            githubID: profile.id,
            avatar: profile.photos?.[0]?.value || '',
          },
        });
      }

      return done(null, user);
    } catch (error) {
      done(error as Error);
    }
  }
));

// serializeUser / deserializeUser are registered once in config/passport.ts.
// Do not register them here — duplicate registrations silently overwrite each other.

export default passport;