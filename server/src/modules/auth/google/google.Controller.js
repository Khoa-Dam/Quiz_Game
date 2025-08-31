// src/modules/auth/google/googleController.js
import { createGoogleOAuthClient, googleAuthUrl } from "../../../config/googleOAuth.js";
import { authService } from "../auth.Service.js";
import { tokenService } from "../token.Service.js";

const { FRONTEND_URL } = process.env;

/**
 * GET /api/v1/auth/google
 * Redirect user sang Google consent
 */
export async function googleStart(req, res) {
    try {
        const { redirect = FRONTEND_URL } = req.query;
        const url = googleAuthUrl(encodeURIComponent(redirect));
        return res.redirect(url);
    } catch (e) {
        console.error("[googleStart] error:", e);
        return res.status(500).json({ success: false, message: e.message });
    }
}

/**
 * GET /api/v1/auth/google/callback
 * Google quay về với ?code=...
 */
export async function googleCallback(req, res) {
    try {
        const code = req.query.code;
        const state = req.query.state ? decodeURIComponent(req.query.state) : FRONTEND_URL;

        if (!code) {
            return res.status(400).json({ success: false, message: "Missing code" });
        }

        const client = createGoogleOAuthClient();
        const { tokens } = await client.getToken(code);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // Tìm/tạo user
        const user = await authService.findOrCreateGoogleUser({
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || payload.email?.split("@")[0],
            avatar: payload.picture,
            emailVerified: !!payload.email_verified,
        });

        // Tạo token và set cookie
        const token = tokenService.createToken(user._id.toString());
        tokenService.setCookie(res, token);

        // Redirect về Frontend
        const redirectUrl = new URL(state || FRONTEND_URL);
        redirectUrl.searchParams.set('oauth_success', 'true');
        return res.redirect(redirectUrl.toString());
        
    } catch (e) {
        console.error("[googleCallback] error:", e);
        return res.status(500).json({ success: false, message: e.message });
    }
}


