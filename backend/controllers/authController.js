import authService from '../services/authService.js';
import apiResponse from '../utils/apiResponse.js';
import {setTokenCookies,clearTokenCookies} from '../utils/cookies.js';
class AuthController{
    async register(req,res,next){
        try{
            const {email,password}=req.body || {};
            const user=await authService.register(email,password);
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
                res,{ user,accessToken:tokens.accessToken   
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
            const tokens=authService.generateTokens(user);
            await authService.saveRefreshToken(user.id,tokens.refreshToken);
            await authService.createSession(user.id,{
                loginTime:new Date(),
                ip:req.ip,
                userAgent:req.get('user-agent')
            })

            setTokenCookies(res,tokens.accessToken,tokens.refreshToken);
            return apiResponse.success(res,{user,accessToken:tokens.accessToken},'Login Successful');
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
}
export default new AuthController();