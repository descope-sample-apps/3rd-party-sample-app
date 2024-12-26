# 3rd-party-sample-app

This is a sample application to get you familiarized with working with Descope's 3rd party sample applications

## Getting Started

In order to launch this app:

1. Clone the repo

```
git clone git@github.com:descope-sample-apps/3rd-party-sample-app.git
```

2. Set up Descope environment variables in .env.local file

Either copy the below, or copy the included `.env.local.example` to `.env.example`. Provide the applicable configurations for your project.

```
AUTH_SECRET="" # Added by `npx auth`. Read more: https://cli.authjs.dev
CLIENT_SECRET="" # The client Secret of the configured 3rd party application within Descope.
CLIENT_ID="" # The client ID of the configured 3rd party application within Descope.
BASE_URL="https://api.descope.com" # The custom CNAME URL of your Descope project. If not configured, leave as is.
PROJECT_ID="" # The project ID of your Descope project.
SCOPES="openid" # The scope of the user. If not configured, leave as is.
CONSENT_SCOPES="" # The consent scope to validate for the user, these would be configured under permission scopes within Descope. If not configured, leave as is.
```

3. Install dependencies

``` bash
npm i
# or
yarn install
```

4. Start the app

```bash
npm run dev
# or
yarn dev
```

## Utilizing the Application

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Initiate a 3rd Party Application Consent

You can initiate a 3rd Party Consent by clicking on the `Connect Descoper Site`. This will navigate to the `Flow Hosting URL` configured within the 3rd Party Application within Descope.

#### Partner Application Side

Once you have authenticated, within the Partner Application Pane of the application, you can then refresh the user's tokens, or sign out of the application. The user's `id_token` is parsed to be human readable, and the access_token and refresh_token are displayed

#### Partner Backend Side

Within the right-hand side of the application, you can click the `Get App Token` button to fetch the application's `access_token` which can then be used to query for a user's `access_token` to do stuff on their behalf

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
