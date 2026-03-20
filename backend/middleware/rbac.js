import apiResponse from '../utils/apiResponse.js';
import roleService from '../services/roleService.js';

export const hasPermission=(permissionName)=>{
    return async(requestAnimationFrame,res,next)=>{
        try{
            if(!req.user){
                 return apiResponse.error(res,'Authentication required',401);
            }

            const hasPermission=await roleService.userHasPermission(req.user_id,permissionName);

            if(!hasPermission){
                return apiResponse.error(res,`Insufficient permission:${permissionName} required`,403);
            }
            next();
        }
        catch(error){
            next(error);
        }
    }
};

    export const hasAnyPermission=(permissionNames)=>{
        return async(req,res,next)=>{
            try{
                if(!req.user){
                    return apiResponse.error(res,'Authentication required',401);
                }
                const hasAny=await roleService.userHasAnyPermission(req.user.id,permissionNames);
                 if(!hasAny){
                    return apiResponse.error(res,`Insufficient permissions.Need one of: ${permissionNames.join(', ')}`,403);
                 }
                 next();
            }
            catch(error){
               next(error);
            }
        };
};

export const isOwnerOrHasPermission=(resourceIdParam,permissionName)=>{
    return async(req,res,next)=>{
        try{
             if(!req.user){
                return apiResponse.error(res,'Authentication required',401);
             }
             const hasPermission=await roleService.userHasPermission(req.user.id,permissionName);
             if(hasPermission){
                return next();
             }
             const resourceUserId=req.params[resourceIdParam] || req.body[resourceIdParam];
             if(resourceUserId===req.user.id){
                return next();
             }
             return apiResponse.error(res,'You do not have permission to access this resource',403);
        }
        catch (error){
           next(error);
        }
    };
};

export const canAccessFile=(fileUserId)=>{
    return async(req,res,next)=>{
        try{
           if(!req.user){
            return apiResponse.error(res,'Authentication required',401);
           }

           if(req.user.id===fileUserId){
            return next();
           }

           const canAccessAll=await roleService.userHasPermission(req.user.id,'file:read:all');

           if(canAccessAll){
            return next();
           }

           return apiResponse.error(res,'You do not have permission to access this file',403);
        }
        catch(error){
           next(error);
        }
    };
};

export const auditLog=(action)=>{
    return(req,res,next)=>{
        const user=req.user ? req.user.email:'anonymous';
        console.log(`[AUDIT] ${action} - User: ${user} -IP:${req.ip} - Time:${new Date().toISOString()}`);
        next();
    };
};