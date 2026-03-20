import authService from '../services/authService.js';
import apiResponse from '../utils/apiResponse.js';
import {setTokenCookies,clearTokenCookies} from '../utils/cookies.js';
import emailService from '../utils/email.js';
class AuthController{
    async register(req,res,next){
        try{
            const {email,password}=req.body || {};
            const user=await authService.register(email,password);
            let verificationEmailSent=false;

            if(!user.is_email_verified){
                try{
                    const verificationToken=await authService.createEmailVerificationToken(user.id);
                    await emailService.sendVerificationEmail(user.email,verificationToken);
                    verificationEmailSent=true;
                }
                catch(emailError){
                    console.error('Failed to send verification email during register:',emailError.message);
                }
            }

            //generate tokens
            const tokens=authService.generateTokens({...user,roles:['user']});

            //save refresh tokens
            await authService.saveRefreshToken(user.id,tokens.refreshToken);

            await authService.createSession(user.id,{
                loginTime:new Date(),
                ip:req.ip,
                userAgent:req.get('user-agent')
            });

            //Set cookies
            setTokenCookies(res,tokens.accessToken,tokens.refreshToken);

            return apiResponse.success(
                res,{ user,accessToken:tokens.accessToken,verificationEmailSent
                },
                'User registered successfully',
                201
            )
        }
        catch (error){
             if(error.message==='User already exists'){
                return apiResponse.error(res,error.message,409);
               }     
               next(error);
        }
    }
    
    async login(req,res,next){
        try{
            const {email,password}=req.body;
            const user=await authService.login(email,password);
            let verificationEmailSent=false;

            if(!user.is_email_verified){
                try{
                    const verificationToken=await authService.createEmailVerificationToken(user.id);
                    await emailService.sendVerificationEmail(user.email,verificationToken);
                    verificationEmailSent=true;
                }
                catch(emailError){
                    console.error('Failed to send verification email during login:',emailError.message);
                }
            }

            const tokens=authService.generateTokens(user);
            await authService.saveRefreshToken(user.id,tokens.refreshToken);
            await authService.createSession(user.id,{
                loginTime:new Date(),
                ip:req.ip,
                userAgent:req.get('user-agent')
            })

            setTokenCookies(res,tokens.accessToken,tokens.refreshToken);
            return apiResponse.success(res,{user,accessToken:tokens.accessToken,verificationEmailSent},'Login Successful');
        }
        catch(error){
            if(error.message==='Invalid credentials'){
                return apiResponse.error(res,error.message,401);
            }
            next(error);
        }
    }

    async logout(req,res,next){
        try{
            const refreshToken=req.cookies ?.refreshToken;
            if(refreshToken){
                await authService.revokeRefreshToken(refreshToken);
            }
            clearTokenCookies(res);
            return apiResponse.success(res,null,'Logout successful');
        }
        catch (error){
            next(error);
        }
    }
    
    async refresh(req,res,next){
        try{
            const {accessToken,refreshToken}=req.tokens;

            setTokenCookies(res,accessToken,refreshToken);

            return apiResponse.success(
                res,{accessToken},'Token refreshed successfully'
            );
        }
        catch(error){
            next(error);
        }
    }

    async getProfile(req,res,next){
        try{
            const {userId}=req.query;
            if(!userId){
                return apiResponse.error(res,'User ID required',400);
            }

            const user=await authService.getuserById(userId);

            if(!user){
                return apiResponse.error(res,'User not found',404);
            }
            return apiResponse.success(res,{user},{sessions:[]},'Profile fetched successfully');
        }
        catch(error){
            next(error);
        }
    }

    async getSessions(req,res,next){
        try{
            if(!req.user?.id){
                return apiResponse.error(res,'Authentication required',401);
            }

            const sessions=await authService.getUserSessions(req.user.id);
            return apiResponse.success(res,{sessions},'Sessions fetched successfully');
        }
        catch(error){
            next(error);
        }
    }

    async revokeAllSessions(req,res,next){
        try{
            await authService.revokeAllUserTokens(req.user.id);
            clearTokenCookies(res);

            return apiResponse.success(res,null,'All sessions revoked');
        }
        catch(error){
            next(error);
        }
    }

    async forgotPassword(req,res,next){
        try{
           const {email}=req.body;

           const resetToken=await authService.createPasswordResetToken(email);

           if(resetToken){
            await emailService.sendPasswordResetEmail(email,resetToken);
           }
           return apiResponse.success(res,null,'If your email is registered, you will receive a password reset link');
        }
        catch(error){
             next(error);
        }
    }

    async resetPassword(req,res,next){
        try{
            const {token,newPassword}=req.body;
            const result=await authService.resetPassword(token,newPassword);

            return apiResponse.success(res,{email:result.email},'Password reset successful. You can now login with your new password.');
        }
        catch (error){
            if(error.message==='Invalid or expired token'){
                return apiResponse.error(res,error.message,400);
            }
            next(error);
        }
    }

    async resetPasswordFromLink(req,res,next){
        try{
            const {token=''}=req.query;

            if(!token){
                return res.status(400).send(`
                    <!doctype html>
                    <html>
                    <head><title>Password Reset</title></head>
                    <body style="font-family:Arial,sans-serif;padding:24px;">
                        <h2>Invalid reset link</h2>
                        <p>This reset link is missing a token.</p>
                    </body>
                    </html>
                `);
            }

            return res.status(200).send(`
                <!doctype html>
                <html>
                <head>
                    <title>Reset Password</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                </head>
                <body style="font-family:Arial,sans-serif;padding:24px;max-width:480px;margin:0 auto;">
                    <h2>Reset your password</h2>
                    <p>Enter your new password below.</p>
                    <form id="resetForm">
                        <input id="newPassword" type="password" placeholder="New password" style="width:100%;padding:10px;margin:12px 0;border:1px solid #ccc;border-radius:6px;" required minlength="6" />
                        <button type="submit" style="background:#4CAF50;color:#fff;border:none;padding:10px 14px;border-radius:6px;cursor:pointer;">Reset Password</button>
                    </form>
                    <p id="status" style="margin-top:12px;"></p>
                    <script>
                        (function () {
                            const form = document.getElementById('resetForm');
                            const status = document.getElementById('status');
                            const token = ${JSON.stringify(token)};

                            form.addEventListener('submit', async function (event) {
                                event.preventDefault();
                                const newPassword = document.getElementById('newPassword').value;

                                status.textContent = 'Submitting...';
                                try {
                                    const response = await fetch('/api/auth/reset-password', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ token, newPassword })
                                    });

                                    const body = await response.json();
                                    if (!response.ok) {
                                        throw new Error(body.message || 'Reset failed');
                                    }

                                    status.style.color = '#2e7d32';
                                    status.textContent = 'Password reset successful. You can now log in.';
                                } catch (error) {
                                    status.style.color = '#c62828';
                                    status.textContent = error.message || 'Reset failed';
                                }
                            });
                        })();
                    </script>
                </body>
                </html>
            `);
        }
        catch(error){
            next(error);
        }
    }

    async sendVerificationEmail(req,res,next){
        try{
            const {email}=req.body;
            const result=await authService.resendVerificationEmail(email);

            if(result){
                                await emailService.sendVerificationEmail(email,result.token);
            }
            return apiResponse.success(res,null,'If your email is registered and not verified, a verification link will be sent');
        }
        catch(error){
           if(error.message==='Email already verified'){
            return apiResponse.error(res,error.message,400);
           }
           next (error);
        }
    }

    async verifyEmail(req,res,next){
        try{
           const {token}=req.body;
           const result=await authService.verifyEmail(token);

           await emailService.sendWelcomeEmail(result.email);

           return apiResponse.success(res,{email:result.email},'Email verified successfully');
        }
        catch(error){
           if(error.message==='Invalid or expired token'){
             return apiResponse.error(res,error.message,400);
           }
           next(error);
        }
    }

    async verifyEmailFromLink(req,res,next){
        try{
            const {token}=req.query;

            if(!token){
                return res.status(400).send(`
                    <!doctype html>
                    <html>
                    <head><title>Email Verification</title></head>
                    <body style="font-family:Arial,sans-serif;padding:24px;">
                        <h2>Invalid verification link</h2>
                        <p>This verification link is missing a token.</p>
                    </body>
                    </html>
                `);
            }

            const result=await authService.verifyEmail(token);
            await emailService.sendWelcomeEmail(result.email);

            return res.status(200).send(`
                <!doctype html>
                <html>
                <head><title>Email Verification</title></head>
                <body style="font-family:Arial,sans-serif;padding:24px;">
                    <h2>Email verified successfully</h2>
                    <p>Your email is now verified. You can return to the app and continue.</p>
                </body>
                </html>
            `);
        }
        catch(error){
            if(error.message==='Invalid or expired token'){
                return res.status(400).send(`
                    <!doctype html>
                    <html>
                    <head><title>Email Verification</title></head>
                    <body style="font-family:Arial,sans-serif;padding:24px;">
                        <h2>Verification failed</h2>
                        <p>This link is invalid or has expired.</p>
                    </body>
                    </html>
                `);
            }
            next(error);
        }
    }

    async checkVerificationStatus(req,res,next){
        try{
            return apiResponse.success(res,{isVerified:req.user.is_email_verified},'Verification status fetched');
        }
        catch(error){
           next(error);
        }
    }
}
export default new AuthController();