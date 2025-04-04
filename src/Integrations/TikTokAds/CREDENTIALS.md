# TikTok Ads Connector Authentication Guide

To use the TikTok Ads connector, you need to obtain an access token from the TikTok Business API. This guide will walk you through the process.

## Prerequisites

1. You must have a TikTok For Business account
2. You must have Advertiser access to the account(s) you want to pull data from
3. You must have developer access to create an app

## Steps to Obtain Credentials

### 1. Create a Developer App

1. Go to the [TikTok for Developers](https://developers.tiktok.com/) portal
2. Log in with your TikTok for Business account credentials
3. Navigate to "My Apps" and click "Create App"
4. Fill in the required information:
   - App Name
   - App Description
   - Select "Business" as the app type
   - Choose the "Advertising" category
   - Provide a website URL (can be your company website)
5. Complete the application and wait for approval

### 2. Configure the App

1. Once your app is approved, go to "My Apps" and select your app
2. Navigate to the "App Settings" section
3. Under the "Permissions" tab, request access to the following scopes:
   - `ads.read` - Required to read advertising data
   - `advertiser.read` - Required to access advertiser information
4. Add a redirect URI (this can be a placeholder like `https://localhost` if you're just generating a token)
5. Save your changes

### 3. Generate an Access Token

#### Option 1: Using the Developer Console

1. In the TikTok for Developers portal, go to "My Apps" and select your app
2. Navigate to the "Tools" section and select "Access Token Tool"
3. Select the required scopes (`ads.read` and `advertiser.read`)
4. Click "Generate Token"
5. Copy the access token provided

#### Option 2: Using OAuth Flow

If you need to programmatically refresh tokens or want a more integrated approach:

1. Redirect users to:
   ```
   https://ads.tiktok.com/marketing_api/auth?app_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&state=YOUR_STATE&scope=ads.read,advertiser.read
   ```
2. After authentication, users will be redirected to your redirect URI with a code parameter
3. Exchange this code for an access token by making a POST request to:
   ```
   https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/
   ```
   with the following parameters:
   - `app_id`: Your app ID
   - `auth_code`: The code from the redirect
   - `secret`: Your app secret

## Getting Advertiser IDs

1. Once you have an access token, you can use the following endpoint to get a list of advertisers accessible to your account:
   ```
   https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/
   ```
2. Make a GET request to this endpoint with your access token in the "Access-Token" header
3. The response will include a list of advertiser IDs that you can use in the connector

## Token Validity and Refreshing

- TikTok access tokens are valid for 24 hours
- For production use, implement a token refresh process using the refresh token
- For regular use of this connector, it's recommended to regenerate a new token daily before running your imports

## Security Considerations

- Store your access token securely
- Do not share your app secret or access tokens
- Consider implementing token refresh logic for production environments 