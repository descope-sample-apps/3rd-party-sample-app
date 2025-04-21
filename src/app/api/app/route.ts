import { auth, baseUrl, clientId, clientSecret, consentScopes } from "@/auth";
import { NextResponse } from "next/server";

export const GET = auth(async function GET(req) {
    if (req.auth) {
        const body = "grant_type=client_credentials" +
            "&client_id=" + clientId +
            "&client_secret=" + clientSecret +
            "&scope=" + consentScopes;
        const res = await fetch(`${baseUrl}/oauth2/v1/apps/token`, {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            body,
        });
        return NextResponse.json(await res.json(), { status: res.status });
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}) as any;