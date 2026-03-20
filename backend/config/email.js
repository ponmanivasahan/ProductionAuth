import dotenv from 'dotenv'
dotenv.config();

export default{
    smtp:{
        host:process.env.SMTP_HOST,
        port:parseInt(process.env.SMTP_PORT),
        secure:process.env.SMTP_SECURE==='true',
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS
        }
    },
    from:process.env.SMTP_FROM || process.env.SMTP_USER,
    frontendUrl:process.env.FRONTEND_URL,
    backendUrl:process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,
    toeknExpiry:{
        passwordReset:process.env.PASSWORD_RESET_EXPIRY,
        emailVerification:process.env.EMAIL_VERIFY_EXPIRY
    }
}