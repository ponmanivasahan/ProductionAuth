import dotenv from 'dotenv';
dotenv.config();
export default{
    google:{
        clientId:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:process.env.GOOGLE_CALLBACK_URL,
        scope:['profile','email'],
        authorizationURL:'https://accounts.google.com/o/oauth2/v2/auth',
        tokenURL:'https://oauth2.googleapis.com/token',
        userInfoURL:'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    hackclub:{
        clientId:process.env.HACKCLUB_CLIENT_ID,
        clientSecret:process.env.HACKCLUB_CLIENT_SECRET,
        callbackURL:process.env.HACKCLUB_CALLBACK_URL,
        scope:['identify','email'],
        authorizationURL:'https://hcb.hackclub.com/api/v4/oauth/authorize',
        tokenURL:'https://hcb.hackclub.com/api/v4/oauth/token',
        userInfoURL:'https://hcb.hackclub.com/api/v4/user'
    },

    redirects:{
        success:process.env.OAUTH_SUCCESS_REDIRECT,
        failure:process.env.OAUTH_FAILURE_REDIRECT
    }
}