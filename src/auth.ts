import NextAuth, { DefaultSession } from "next-auth";
import { OIDCConfig, OIDCUserConfig } from "next-auth/providers";
import { DescopeProfile } from "next-auth/providers/descope";

export const baseUrl = process.env.BASE_URL ?? "https://api.descope.com";
export const projectId = process.env.PROJECT_ID ?? "";
export const issuer = baseUrl + "/v1/apps/" + projectId;
export const clientId =  process.env.CLIENT_ID ?? "";
export const clientSecret = process.env.CLIENT_SECRET ?? "";
export const scope = process.env.SCOPE  ?? "openid";
export const consentScopes = process.env.CONSENT_SCOPES ?? "";

const DescopeOAuthApps = ( // based on Descope provider
    config: OIDCUserConfig<DescopeProfile>,
): OIDCConfig<DescopeProfile> => {
    return {
        id: "customapp",
        name: "Custom App", 
        type: "oidc",
        style: { bg: "#1C1C23", text: "#ffffff" },
        checks: ["pkce", "state"],
        options: config,
        authorization: {
            params: { scope, prompt: "consent", access_type: "offline" },
        },
        client: { token_endpoint_auth_method: "client_secret_post" }, // required for backend exchange of app token
        profile(profile) {
            return {
                id: profile.sub,
            }
        },


    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: true,

    providers: [{
        ...DescopeOAuthApps({ issuer }),
        clientId,
        clientSecret,
    }],
    callbacks: {
        // we use the `jwt` callback to control what goes into the JWT
        // https://authjs.dev/guides/refresh-token-rotation#jwt-strategy
        // using the database strategy is preferred for production
        async jwt({ token, account, session }) {
            if (token.error)
                delete token.error
            if (account) {
                // First-time login, save the `access_token`, its expiry and the `refresh_token`
                return {
                    // there's a limit of 4096 bytes for the JWT payload, so we only store the necessary data
                    // use the database strategy for production..
                    ...token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    id_token: account.id_token ? Buffer.from(account.id_token.split(".")[1], "base64").toString() : "",
                }
            } else if (!session?.refresh && token.expires_at && Date.now() < token.expires_at * 1000) {
                // Subsequent logins, but the `access_token` is still valid
                return token
            } else {
                // Subsequent logins, but the `access_token` has expired, try to refresh it
                if (!token.refresh_token) throw new TypeError("Missing refresh_token")

                try {
                    // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
                    // at their `/.well-known/openid-configuration` endpoint.
                    const response = await fetch(baseUrl + "/oauth2/v1/apps/token", {
                        method: "POST",
                        body: new URLSearchParams({
                            client_id: clientId,
                            client_secret: clientSecret,
                            grant_type: "refresh_token",
                            refresh_token: token.refresh_token!,
                        }),
                    })

                    const tokensOrError = await response.json()

                    if (!response.ok) throw tokensOrError

                    const newTokens = tokensOrError as {
                        access_token: string
                        expires_in: number
                        refresh_token?: string
                        id_token?: string
                    }

                    token.access_token = newTokens.access_token
                    token.id_token = newTokens.id_token ? Buffer.from(newTokens.id_token.split(".")[1], "base64").toString() : "";
                    token.expires_at = Math.floor(
                        Date.now() / 1000 + newTokens.expires_in
                    )
                    // Some providers only issue refresh tokens once, so preserve if we did not get a new one
                    if (newTokens.refresh_token)
                        token.refresh_token = newTokens.refresh_token

                    return token
                } catch (error) {
                    console.error("Error refreshing access_token", error)
                    // If we fail to refresh the token, return an error so we can handle it on the page
                    token.error = "RefreshTokenError"
                    return token
                }
            }
        },
        async session({ session, token }) {
            session.error = token.error
            session.user.id_token = token.id_token
            session.user.access_token = token.access_token
            session.user.refresh_token = token.refresh_token
            session.user.expires_at = token.expires_at
            return session
        },
    },

});


declare module "next-auth" {
    interface Session {
        error?: "RefreshTokenError"
        user: {
            id_token?: string
            access_token?: string
            expires_at?: number
            refresh_token?: string
        } & DefaultSession["user"]
    }
}

declare module "@auth/core/jwt" {
    interface JWT extends DefaultJWT {
        id_token?: string
        access_token?: string
        expires_at?: number
        refresh_token?: string
        error?: "RefreshTokenError"
    }
}