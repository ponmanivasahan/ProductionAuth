import oauthService from '../services/oauthService.js';
import authService from '../services/authService.js';
import oauthConfig from '../config/oauth.js';
import { setTokenCookies } from './../utils/cookies.js';
import apiResponse from '../utils/apiResponse.js';

class OAuthController{
    googleAuth(req,res){
        const authURL=oauthService.getGoogleAuthURL();
        res.redirect(authURL);
    }
    async googleCallback(req,res,next){
        try{
            const {code}=req.query;
            if(!code){
                return res.redirect(oauthConfig.redirects.failure);
            }

            const {user,isNewUser}=await oauthService.handleGoogleCallback(code);
            const tokens=authService.generateTokens(user);
            await authService.saveRefreshToken(user.id,tokens.refreshToken);

            await authService.createSession(user.id,{
                loginTime: new Date(),
                ip:req.ip,
                userAgent:req.get('user-agent'),
                provider:'google'
            });

            setTokenCookies(res,tokens.accessToken,tokens.refreshToken);
            const redirectURL=`${oauthConfig.redirects.success}?token=${tokens.accessToken}&new=${isNewUser}`;
            res.redirect(redirectURL);
        }
        catch(error){
           console.error('Google OAuth callback error', error);
           res.redirect(oauthConfig.redirects.failure);
        }
    }
       hackclubAuth(req, res) {
    const authURL = oauthService.getHackClubAuthURL();
    res.redirect(authURL);
  }

    async hackclubCallback(req,res,next){
        try{
            const {code}=req.query;
            if(!code){
                return res.redirect(oauthConfig.redirects.failure);
            }
            const {user,isNewUser} = await oauthService.handleHackClubCallback(code);
            const tokens=authService.generateTokens(user);
            await authService.saveRefreshToken(user.id,tokens.refreshToken);

            await authService.createSession(user.id,{
                loginTime:new Date(),
                ip:req.ip,
                userAgent:req.get('user-agent'),
                provider:'hackclub'
            });

            setTokenCookies(res,tokens.accessToken,tokens.refreshToken);
            const redirectURL=`${oauthConfig.redirects.success}?token=${tokens.accessToken}&new=${isNewUser}`;
            res.redirect(redirectURL);
        }
        catch(error){
           console.error('HackClub OAuth callback error', error);
           res.redirect(oauthConfig.redirects.failure);
        }
    }
    
    async getConnectedAccounts(req,res,next){
        try{
            const accounts=await oauthService.getUserOAuthAccounts(req.user.id);
            return apiResponse.success(
                res,{accounts},'Connected accounts fetched successfully'
            );
        }
        catch(error){
            next(error);
        }
    }

    async disconnectAccount(req,res,next){
        try{
            const {provider}=req.params;
            await oauthService.disconnectOAuthAccount(req.user.id,provider);
            return apiResponse.success(
                res,null, `Disconnected from ${provider} successfully`
            );
        }
        catch(error){
            if(error.message==='Cannot disconnect last authenticate method'){
                return apiResponse.error(res,error.message,400);
            }
            next (error);
        }
    }

    async linkAccount(req,res,next){
        try{
            return apiResponse.error(req,'Link account flow not implemented',501);
        }
        catch(error){
            next (error);
        }
    }

}

export default new OAuthController();