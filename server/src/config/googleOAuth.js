import { OAuth2Client } from "google-auth-library";
import 'dotenv/config';
const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {

    throw new Error("Missing required environment variables for Google OAuth");
}

export const createGoogleOAuthClient = () => {
    return new OAuth2Client({

        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        redirectUri: GOOGLE_CALLBACK_URL
    });
}

export const googleAuthUrl = (state) => {
    const client = createGoogleOAuthClient();
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['profile', 'email'],
        state
    });
    return authUrl;
}