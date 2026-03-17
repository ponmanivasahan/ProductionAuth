import apiResponse from "../utils/apiResponse.js";
const validate=(schema)=>{
    return (req,res,next)=>{
        const errors=[];
        const body = req.body || {};

        if(schema.required){
            schema.required.forEach(field=>{
                if(!body[field]){
                   errors.push(`${field} is required`)
                }
            })
        }

        if(schema.email && body.email){
            const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(body.email)){
                errors.push('Invalid email format');
            }
        }
        if(schema.password && body.password){
            if(body.password.length<6){
                errors.push('Password must be at least 6 cahracters');
            }
        }
        if(errors.length>0){
            return apiResponse.error(res,'Validation failed',400,errors);
        }
        next();
    }
}
export const registerValidation=()=>validate({
    required:['email','password'],
    email:true,
    password:true
})

export const loginValidation=()=>validate({
    required:['email','password'],
    email:true
})

export default validate;