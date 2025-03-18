/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import userModel from "../models/userModel";

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL || "http://localhost:3001"}/auth/google/callback`,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      // Required for private IP addresses
      device_id: "6900b1f0-6b1c-11ec-8d3d-0242ac130003",
      device_name: "Unfit Server"
    } as any,  // Cast to `any` to bypass type checking
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", JSON.stringify(profile));

        let user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await userModel.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `${profile.id}@google.user`;

        const username =
          (profile.displayName || profile.id).replace(/\s/g, "") +
          Math.floor(Math.random() * 10000).toString();

        user = await userModel.create({
          email,
          username,
          googleId: profile.id,
          refreshToken: [],
        });

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error as Error);
      }
    }
  )
);

// Configure Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      callbackURL: `${
        process.env.API_URL || "http://localhost:3001"
      }/auth/facebook/callback`,
      profileFields: ["id", "emails", "name", "displayName"],
      // Enable proof for improved security
      enableProof: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Log profile for debugging
        console.log("Facebook profile:", JSON.stringify(profile));

        // Check if user already exists with this Facebook ID
        let user = await userModel.findOne({ facebookId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user with same email already exists
        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await userModel.findOne({ email });

          if (user) {
            // Link Facebook account to existing user
            user.facebookId = profile.id;
            await user.save();
            return done(null, user);
          }
        } else {
          console.log(
            "No email found in Facebook profile. This might be because your app does not have email permission."
          );
        }

        // Create new user
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `${profile.id}@facebook.user`;

        const username =
          (profile.displayName || profile.id).replace(/\s/g, "") +
          Math.floor(Math.random() * 10000).toString();

        user = await userModel.create({
          email,
          username,
          facebookId: profile.id,
          refreshToken: [],
        });

        return done(null, user);
      } catch (error) {
        console.error("Facebook OAuth error:", error);
        return done(error as Error);
      }
    }
  )
);

// Passport session setup (even though we're using JWT)
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
