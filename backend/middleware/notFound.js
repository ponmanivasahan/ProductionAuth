import apiResponse from '../utils/apiResponse.js'
const notFound=(req,res)=>{
    return apiResponse.error(res,`Route ${req.originalUrl} not found`,404);
}

export default notFound;