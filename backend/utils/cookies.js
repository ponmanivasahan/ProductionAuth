const cookieOptions={
    httpOnly:true,
    secure:process.env.NODE_ENV==='production',
    sameSite:'strict',
    path:'/'
}

export const setTokenCookies=(res,accessToken,refreshToken)=>{
    // i am setting access token here with shorter expiry for now testing
    res.cookie('accessToken',accessToken,{
        ...cookieOptions,
        maxAge:15*60*1000  //15 minutes
    })

    //i am setting refresh token cookie here with longer expiry
    res.cookie('refreshToken',refreshToken,{
        ...cookieOptions,
        maxAge:7*24*60*60*1000 //7 days
        //httpOnly: true   (refresh token is Http only for security)
    })
}

export const clearTokenCookies=(res)=>{
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
}

export const getTokenFromCookie=(req,tokenName)=>{
    return req.cookies?.[tokenName];
}

