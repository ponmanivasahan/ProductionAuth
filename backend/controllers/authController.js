import authService from '../services/authService.js'
import apiResponse from '../utils/apiResponse.js'
class AuthController{
    async register(req,res,next){
        try{
            const {email,password}=req.body || {};
            const user=await authService.register(email,password);

            return apiResponse.success(
                res,{user},'User registered successfully',201
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
            const {email,password}=req.body || {};
            const user=await authService.login(email,password);
            return apiResponse.success(res,{user},'Login Successful');
        }
        catch(error){
            if(error.message==='Invalid credentials'){
                return apiResponse.error(res,error.message,401);
            }
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
            return apiResponse.success(res,{user},'Profile fetched successfully');
        }
        catch(error){
            next(error);
        }
    }
}
export default new AuthController();