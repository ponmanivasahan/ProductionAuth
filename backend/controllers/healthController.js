import pool from '../config/db.js';
import apiResponse from '../utils/apiResponse.js'
const checkHealth=async(req,res,next)=>{
    try{
      const [result]=await pool.query('SELECT 1 as healthCheck');
      const dbHealthy=result[0]?.healthCheck===1;

      const health={
        server:'healthy',
        database:dbHealthy ? 'healthy':'unhealthy',
        uptime:process.uptime(),
        timestamp:new Date().toISOString()
      }
      const statusCode=health.database=='healthy' ? 200 :503;
      return apiResponse.success(res,health,'Health check completed',statusCode);
    }
    catch{
      next(error);
    }
}

const ping=(req,res)=>{
    return apiResponse.success(res,{pong:true},'Server is running');
}

export default{checkHealth,ping};