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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const userModel_1 = __importDefault(require("../models/userModel"));
// Configure Google OAuth Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
        const username = (profile.displayName || profile.id)
            .replace(/\s/g, '') + Math.floor(Math.random() * 10000).toString();
        user = yield userModel_1.default.create({
            email,
            username,
            googleId: profile.id,
            refreshToken: []
        });
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
// Configure Facebook OAuth Strategy
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'displayName']
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
        // Create new user
        const email = profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `${profile.id}@facebook.user`;
        const username = (profile.displayName || profile.id)
            .replace(/\s/g, '') + Math.floor(Math.random() * 10000).toString();
        user = yield userModel_1.default.create({
            email,
            username,
            facebookId: profile.id,
            refreshToken: []
        });
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map