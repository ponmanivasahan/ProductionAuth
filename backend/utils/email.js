import nodemailer from 'nodemailer';
import emailConfig from '../config/email.js';

//create transporter
const transporter=nodemailer.createTransport(emailConfig.smtp);
class EmailService{
    async verifyConnection(){
        try{
          await transporter.verify();
          console.log('SMTP connection verified');
          return true;
        }
        catch(error){
           console.error('SMTP connection failed:', error);
           return false;
        }
    }

    async sendEmail(to,subject,html){
        try{
            const mailOptions={
                from:emailConfig.from,
                to,
                subject,
                html
            };
             const info=await transporter.sendMail(mailOptions);
             console.log(`Email sent : ${info.messageId}`);
             return info;
        }
        catch(error){
             console.error('Error sending email:',error);
             throw new Error('Failed to send email');
        }
    }

    async sendPasswordResetEmail(email,resetToken){
        const resetLink=`${emailConfig.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

        const html=`
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        .container{font-family:Arial,sans-serif;max-width:600px;margin:0 auto; padding:20px;}
        .button{background:#4CAF50; color:white;padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block;}
        .footer{margin-top:30px; font-size:12px; color:#666;}
        </style>
        </head>
        <body>
        <div class="container">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button beow to proceed:</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p>Or copy this link:${resetLink}</p>
        <p>this link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">
         <p>© ${new Date().getFullYear()} Cloud File Management. All rights reserved.</p>
         </div>
         </div>
         </body>
         </html>`;
         return this.sendEmail(email,'Password Reset Request',html);
    }

    //Email verification email
    async sendVerificationEmail(email,verificationToken){
        const verifyLink=`${emailConfig.frontendUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;
        const html=`
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        .container{font-family:Arial,sans-serif; max-width:600px;
        margin:0 auto; padding:20px;}
        .button{background:#2196F3;color:white;padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block;}
        .footer{margin-top:30px; font-size:12px;color:#666;}
        </style>
        </head>
        <body>
        <div class="container">
        <h2>Verify your Email Address</h2>
        <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
        <a href="${verifyLink}" class="button">Verify Email</a>
        <p>Or copy this link:${verifyLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <div class="footer">
        <p>© ${new Date().getFullYear()} Cloud File Management. All rights reserved.</p>
        </div>
        </div>
        </body>
        </html> `;
        return this.sendEmail(email,'Verify Your Email Address',html);
    }

    async sendWelcomeEmail(email){
        const html=`<!DOCTYPE html>
        <html>
        <head>
        <style>
        .container{font-family:Arial,sans-serif;max-width:600px; margin:0 auto; padding:20px;}
        .button{background:#4CAF50; color:white; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block;}
        </style>
        </head>
        <body>
        <div class="container">
        <h2>Welcome to Cloudinary!</h2>
        <p>Your email has been successfully verified.</p>
        <p>You can now:</p>
        <ul>
        <li>Upload files securely</li>
        <li>Manage your documents</li>
        <li>Use PDF tools</li>
        <li>And more!</li>
        </ul>
        <a href="${emailConfig.frontendUrl}/dashboard" class="button">Go to Dashboard </a>
        </div>
        </body>
        </html>`;
        return this.sendEmail(email,'Welcome to Clodinary',html);
    }
}

export default new EmailService();