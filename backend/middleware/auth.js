import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js'
import apiResponse from '../utils/apiResponse.js';
import {getTokenFromCookie} from '../utils/cookies.js';
import authService from '../services/authService.js';

export const authenticate=async(req,res,next)=>{
   try{
    let token=getTokenFromCookie(req,'accessToken');

    if(!token){
        const authHeader=req.headers.authorization;
        if(authHeader && authHeader.startsWith('Bearer')){
            token=authHeader.substring(7);
        }
    }

    if(!token){
        return apiResponse.error(res,'Authentication required',401);
    }
    const decoded=jwt.verify(token,authConfig.jwt.accessSecret);

    const user=await authService.getuserById(decoded.userId);

    if(!user){
        return apiResponse.error(res,'User not found',401);
    }
    req.user=user;
    next();
   }
   catch(error){
    if(error.name==='TokenExpiredError'){
        return apiResponse.error(res,'Token expired',401);
    }
    if(error.name==='JsonWebTokenError'){
        return apiResponse.error(res,'Invalid token',401);
    }
    next(error);
   }
}


export const authorize=(...allowedRoles)=>{
    return(req,res,next)=>{
        if(!req.user){
            return apiResponse.error(res,'Authentication required',401);
        }
        const userRoles=req.user.roles || [];
        const hasAllowedRole=userRoles.some(role=>allowedRoles.includes(role));

        if(!hasAllowedRole){
            return apiResponse.error(res,'Insufficient permissions',403);
        }
        next();
    }
}

export const refreshToken=async(req,res,next)=>{
    try{
       const refreshToken=getTokenFromCookie(req,'refreshToken');
       if(!refreshToken){
        return apiResponse.error(res,'Refresh token required',401);
       }

       //verify refresh token
       const decoded=await authService.verifyRefreshToken(refreshToken);

       if(!decoded){
        return apiResponse.error(res,'Invalid refresh token',401);
       }

       const user=await authService.getuserById(decoded.userId);

       if(!user){
        return apiResponse.error(res,'User not found',401);
       }

       const tokens=authService.generateTokens(user);
       await authService.saveRefreshToken(user.id,tokens.refreshToken);

       await authService.revokeRefreshToken(refreshToken);

       req.tokens=tokens;
       req.user=user;
       next();
    }
    catch(error){
        next(error);
    }
}