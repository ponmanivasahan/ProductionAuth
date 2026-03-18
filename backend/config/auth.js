import dotenv from'dotenv'
dotenv.config();

export default{
   jwt:{
    accessSecret:process.env.JWT_SECRET,
    refreshSecret:process.env.JWT_REFRESH_SECRET,
    accessExpiry:process.env.JWT_ACCESS_EXPIRY,
    refreshExpiry:process.env.JWT_REFRESH_EXPIRY
   },
   cookies:{
    secret:process.env.COOKIE_SECRET,
    options:{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:'strict',
        maxAge:7*24*60*60*1000 //7 days
    }
   }
}