import apiResponse from '../utils/apiResponse.js';
const errorHandler=(err,req,res,next)=>{
    console.error('Error:',err.message);

    const statusCode=err.statusCode || 500;
    const message=err.message  || 'Internal Server Error';
    return apiResponse.error(res,message,statusCode);
}
export default errorHandler;