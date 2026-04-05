import dotenv from 'dotenv'
dotenv.config();

const normalize = (value) => (value || '').trim();
const parseBoolean = (value) => {
    const normalized = normalize(value).toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
    return undefined;
};

const smtpProvider = normalize(process.env.SMTP_PROVIDER).toLowerCase();
const defaultSmtpByProvider = {
    brevo: {
        host: 'smtp-relay.brevo.com',
        port: 587,
        requireTLS: true
    }
};

const providerDefaults = defaultSmtpByProvider[smtpProvider] || {};
const smtpHost = normalize(process.env.SMTP_HOST || providerDefaults.host);
const smtpPort = parseInt(normalize(process.env.SMTP_PORT || String(providerDefaults.port || 587)), 10);
const explicitSecure = parseBoolean(process.env.SMTP_SECURE);

// If SMTP_SECURE is omitted, infer from common SMTP ports.
const smtpSecure = explicitSecure ?? (smtpPort === 465);
const smtpRequireTLS = parseBoolean(process.env.SMTP_REQUIRE_TLS) ?? Boolean(providerDefaults.requireTLS && smtpPort === 587);

export default{
    smtp:{
        host:smtpHost,
        port:smtpPort,
        secure:smtpSecure,
        requireTLS:smtpRequireTLS,
        auth:{
            user:normalize(process.env.SMTP_USER),
            pass:normalize(process.env.SMTP_PASS)
        },
        tls:{
            minVersion:'TLSv1.2'
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