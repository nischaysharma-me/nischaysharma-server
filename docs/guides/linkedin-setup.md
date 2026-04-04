# How to Get Your LinkedIn Client ID and Client Secret

To enable LinkedIn features on TaughtCode, you need to create a LinkedIn Developer Application. Follow these simple steps to get your credentials.

## Step 1: Access the LinkedIn Developer Portal
1. Go to the [LinkedIn Developers](https://www.linkedin.com/developers/) website.
2. Log in with your standard LinkedIn account.

## Step 2: Create a New App
1. Click the **"Create app"** button.
2. **App Name**: Enter a name (e.g., "My TaughtCode Profile").
3. **LinkedIn Page**: You must associate the app with a LinkedIn Page. If you don't have one, you can [create a simple company page](https://www.linkedin.com/company/setup/new/) in a few minutes.
4. **App Logo**: Upload any square image.
5. Review the terms and click **"Create app"**.

## Step 3: Verify Your App
LinkedIn requires you to verify your association with the Page you selected:
1. In your App dashboard, click the **"Settings"** tab.
2. Look for the **"App verification"** section.
3. Click **"Generate verification URL"** and open it to verify the app as the page administrator.

## Step 4: Enable Permissions (Products)
1. Go to the **"Products"** tab in your app settings.
2. Find **"Share on LinkedIn"** and click **"Request access"**. (Used for posting content).
3. Find **"Sign In with LinkedIn using OpenID Connect"** and click **"Request access"**. (This is mandatory for the initial connection and profile sync).
*Note: These products are usually approved automatically within a few minutes.*

## Step 5: Get Your Credentials
1. Go to the **"Auth"** tab.
2. Here you will see your **Client ID**.
3. Click the eye icon next to **Client Secret** to reveal it.
4. **Important**: Copy these values; you will need to add them to your TaughtCode configuration.

## Step 6: Configure Redirect URL
1. Still on the **"Auth"** tab, scroll down to **"OAuth 2.0 settings"**.
2. Click the edit pencil icon next to **"Authorized redirect URLs for your app"**.
3. Click **"Add redirect URL"**.
4. Enter: `http://localhost:3002/api/v1/integrations/linkedin/callback` (or your production URL).
5. Click **"Update"**.

You are all set! You can now use these credentials to link your LinkedIn account to TaughtCode.
