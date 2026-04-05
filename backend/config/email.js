import dotenv from 'dotenv'
dotenv.config();

const normalize = (value) => (value || '').trim();
const normalizeSmtpPassword = (value) => normalize(value).replace(/\s+/g, '');

export default{
    smtp:{
        host:normalize(process.env.SMTP_HOST),
        port:parseInt(normalize(process.env.SMTP_PORT || '587'), 10),
        secure:normalize(process.env.SMTP_SECURE || 'false')==='true',
        auth:{
            user:normalize(process.env.SMTP_USER),
            pass:normalizeSmtpPassword(process.env.SMTP_PASS)
        }
    },
    from:normalize(process.env.SMTP_FROM || process.env.SMTP_USER),
    frontendUrl:normalize(process.env.FRONTEND_URL),
    backendUrl:normalize(process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`),
    toeknExpiry:{
        passwordReset:normalize(process.env.PASSWORD_RESET_EXPIRY || '1h'),
        emailVerification:normalize(process.env.EMAIL_VERIFY_EXPIRY || '24h')
    }
}