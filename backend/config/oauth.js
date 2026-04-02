import dotenv from 'dotenv';
dotenv.config();
export default{
    google:{
        clientId:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:process.env.GOOGLE_CALLBACK_URL,
        scope:['profile','email'],
        authorizationURL:'https://account.google.com/o/auth2/v2/auth',
        tokenURL:'https://oauth2.googleapis.com/token',
        uesrInfoURL:'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    hackclub:{
        clientId:process.env.HACKCLUB_CLIENT_ID,
        clientSecret:process.env.HACKCLUB_CLIENT_SECRET,
        callbackURL:process.env.HACKCLUB_CALLBACK_URL,
        scope:['identity','email'],
        authorizationURL:'https://hackclub.com/oauth/authorize',
        tokenURL:'https://hackclub.com/oauth/token',
        userInfoURL:'https://hackclub.com/api/user'
    },

    redirects:{
        success:process.env.OAUTH_SUCCESS_REDIRECT,
        failure:process.env.OAUTH_FAILURE_REDIRECT
    }
}