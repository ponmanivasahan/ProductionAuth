import axios from 'axios';
const API_URL=import.meta.env.VITE_API_URL;
const api=axios.create({
    baseURL:API_URL,
    headers:{
        'Content-Type':'application/json',
    },
    withCredentials:true,
})

api.interceptors.request.use(
    (config)=>{
        const token=localStorage.getItem('accessToken');
        if(token){
            config.headers.Authorization=`Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
       return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response)=>response,
    async(error)=>{
        const originalRequest=error.config;
        const authEndpoints=['/auth/login','/auth/register','/auth/forgot-password','/auth/reset-password'];
        const isAuthEndpoint=authEndpoints.some(endpoint=>originalRequest.url.includes(endpoint));
        
        if(error.response?.status===401 && !originalRequest._retry && !isAuthEndpoint){
            originalRequest._retry=true;
            try{
                const response=await api.post('/auth/refresh');
                const {accessToken}=response.data.data;
                localStorage.setItem('accessToken',accessToken);
                originalRequest.headers.Authorization=`Bearer ${accessToken}`;
                return api(originalRequest);
            }
            catch(refreshError){
               localStorage.removeItem('accessToken');
               localStorage.removeItem('user');
               window.location.href='/login';
               return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
)
export default api;