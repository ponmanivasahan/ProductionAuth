import roleService from '../services/roleService.js';
import apiResponse from '../utils/apiResponse.js';

class RoleController{
    async getAllRoles(req,res,next){
        try{
            const roles=await roleService.getAllRoles();
            return apiResponse.success(res,{roles},'Roles fetched successfully');
        }
        catch(error){
            next(error);
        }
    }

    async getRoleById(req,res,next){
        try{
            const {roleId}=req.params;
            const role=await roleService.getRoleById(roleId);

            if(!role){
                return apiResponse.error(res,'Role Not Found',404);
            }
            return apiResponse.success(res,{role},'Role fetched successfully');
        }
        catch (error){
          next (error);
        }
    }

    async createRole(req,res,next){
        try{
            const{name,description}=req.body;
            const role=await roleService.createRole(name,description);
            return apiResponse.success(res,{role},'Role created successfully',201);
        }
        catch(error){
            if(error.message==='Role already exists'){
                return apiResponse.error(res,error.message,409);
            }
            next(error);
        }
    }

    async updateRole(req,res,next){
        try{
            const {roleId}=req.params;
            const updates=req.body;

            const role=await roleService.updateRole(roleId,updates);

            if(!role){
                return apiResponse.error(res,'Role not found',404);
            }
            return apiResponse.success(res,{role},'Role updated successfully');
        }
        catch(error){
            next(error);
        }

    }

    async deleteRole(req,res,next){
        try{
            const {roleId}=req.params;
            const deleted=await roleService.deleteRole(roleId);
            if(!deleted){
                 return apiResponse.error(res,'Role Not Found',404);
            }
            return apiResponse.success(res,null,'Role delted successfully');
        }
        catch(error){
            if(error.message==='Cannot delete role that is assigned to users'){
                return apiResponse.error(res,error.message,400);
            }
            next(error);
        }
    }

    async getAllPermissions(req,res,next){
        try{
            const permissions=await roleService.getAllPermissions();
            return apiResponse.success(res,{permissions},'Permissions fetched successfully');
        }
        catch(error){
            next(error);
        }
    }

    async assignPermissions(req,res,next){
        try{
            const {roleId}=req.params;
            const {permissionIds}=req.body;

            const role=await roleService.assignPermissions(roleId,permissionIds);

            return apiResponse.success(res,{role},'Permissions assigned successfully');
        }
        catch(error){
           next(error);
        }
    }

    async assignRoleToUser(req,res,next){
        try{
            const{userId,roleId}=req.params;
            await roleService.assignRoleToUser(userId,roleId);
            return apiResponse.success(res,null,'Role assigned to user successfully');
        }
        catch(error){
            next(error);
        }
    }

    async removeRoleFromUser(req,res,next){
     try{
        const {userId,roleId}=req.params;
        const removed=await roleService.removeRoleFromUser(userId,roleId);

        if(!removed){
            return apiResponse.error(res,'Role assignment not found',404);
        }

        return apiResponse.success(res,null,'Role removed from user successfully');
     }
     catch (error){
          if(error.message==='User must have at least one role'){
            return apiResponse.error(res,error.message,400);
          }
          next(error);
     }
    }

    async getUserPermissions(req,res,next){
        try{
            const {userId}=req.params;
            const data=await roleService.getUserRoles(userId);

            return apiResponse.success(res,data,'User permissions fetched successfully');
        }
        catch(error){
            next(error);
        }
    }

    async getMyPermissions(req,res,next){
        try{
            const data=await roleService.getUserRoles(req.user.id);
            return apiResponse.success(res,data,'Your permissions fetched successfully');
        }
        catch(error){
            next(error);
        }
    }

    async getAllUsersWithRoles(req,res,next){
        try{
            const users=await roleService.getAllUsersWithRoles();

            return apiResponse.success(res,{users},'Users fetched successfully');
        }
        catch(error){
           next (error);
        }
    }
}

export default new RoleController();
