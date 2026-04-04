# How to Get Your GitHub Client ID and Client Secret

To sync your repositories and profile from GitHub, you need to create a GitHub OAuth Application. Follow these steps to get your credentials.

## Step 1: Access GitHub Developer Settings
1. Log in to your [GitHub](https://github.com/) account.
2. Click your profile photo in the top right corner and select **"Settings"**.
3. In the left sidebar, scroll to the bottom and click **"Developer settings"**.

## Step 2: Create a New OAuth App
1. Click **"OAuth Apps"** in the left sidebar.
2. Click the **"New OAuth App"** button (or "Register a new application").

## Step 3: Register the Application
Fill in the following details:
1. **Application name**: Enter a name (e.g., "TaughtCode Integration").
2. **Homepage URL**: Enter `http://localhost:3000` (or your site's home page).
3. **Application description**: Optional.
4. **Authorization callback URL**: Enter: `http://localhost:3002/api/v1/integrations/github/callback` (or your production callback URL).
5. Click **"Register application"**.

## Step 4: Get Your Credentials
1. You will now see your **Client ID**. Copy this down.
2. Click the **"Generate a new client secret"** button.
3. **Important**: Copy the **Client Secret** immediately. GitHub will only show it to you once. If you lose it, you will have to generate a new one.

## Step 5: Save Settings
You don't need to do anything else on GitHub. You can now use this Client ID and Client Secret in your TaughtCode environment variables.

### Quick Reference for Developers:
- **Provider**: GitHub
- **Scopes**: `read:user`, `repo`
- **Auth URL**: `https://github.com/login/oauth/authorize`
- **Token URL**: `https://github.com/login/oauth/access_token`
