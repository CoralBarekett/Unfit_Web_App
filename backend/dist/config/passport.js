"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const userModel_1 = __importDefault(require("../models/userModel"));
// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || "http://localhost:3001"}/auth/google/callback`,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Google profile:", JSON.stringify(profile));
            // Check if user already exists with this Google ID
            let user = yield userModel_1.default.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }
            // Check if user with same email already exists
            if (profile.emails && profile.emails.length > 0) {
                const email = profile.emails[0].value;
                user = yield userModel_1.default.findOne({ email });
                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    yield user.save();
                    return done(null, user);
                }
            }
            // Create new user
            const email = profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : `${profile.id}@google.user`;
            const username = (profile.displayName || profile.id).replace(/\s/g, "") +
                Math.floor(Math.random() * 10000).toString();
            user = yield userModel_1.default.create({
                email,
                username,
                googleId: profile.id,
                refreshToken: [],
            });
            return done(null, user);
        }
        catch (error) {
            console.error("Google OAuth error:", error);
            return done(error);
        }
    })));
}
else {
    console.warn("Google OAuth credentials not found in environment variables");
}
// Configure Facebook OAuth Strategy
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_APP_ID || "",
    clientSecret: process.env.FACEBOOK_APP_SECRET || "",
    callbackURL: `${process.env.API_URL || "http://localhost:3001"}/auth/facebook/callback`,
    profileFields: ["id", "emails", "name", "displayName"],
    // Enable proof for improved security
    enableProof: true,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Log profile for debugging
        console.log("Facebook profile:", JSON.stringify(profile));
        // Check if user already exists with this Facebook ID
        let user = yield userModel_1.default.findOne({ facebookId: profile.id });
        if (user) {
            return done(null, user);
        }
        // Check if user with same email already exists
        if (profile.emails && profile.emails.length > 0) {
            const email = profile.emails[0].value;
            user = yield userModel_1.default.findOne({ email });
            if (user) {
                // Link Facebook account to existing user
                user.facebookId = profile.id;
                yield user.save();
                return done(null, user);
            }
        }
        else {
            console.log("No email found in Facebook profile. This might be because your app does not have email permission.");
        }
        // Create new user
        const email = profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `${profile.id}@facebook.user`;
        const username = (profile.displayName || profile.id).replace(/\s/g, "") +
            Math.floor(Math.random() * 10000).toString();
        user = yield userModel_1.default.create({
            email,
            username,
            facebookId: profile.id,
            refreshToken: [],
        });
        return done(null, user);
    }
    catch (error) {
        console.error("Facebook OAuth error:", error);
        return done(error);
    }
})));
// Passport session setup (even though we're using JWT)
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map