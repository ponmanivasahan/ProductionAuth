import api from './api';
class AuthService{
    async register(email,password){
        const response=await api.post('/auth/register',{email,password});
        if(response.data.data?.accessToken){
            localStorage.setItem('accessToken',response.data.data.accessToken);
            localStorage.setItem('user',JSON.stringify(response.data.data.user));
        }
        return response.data;
    }

    async login(email,password){
        const response=await api.post('/auth/login',{email,password});
        if(response.data.data?.accessToken){
            localStorage.setItem('accessToken',response.data.data?.accessToken);
            localStorage.setItem('user',JSON.stringify(response.data.data.user));
        }
        return response.data;
    }
    async logout(){
        try{
            await api.post('/auth/logout');
        }
        finally{
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
    }
    async getCurrentUser(){
        const response=await api.get('auth/profile');
        return response.data.data.user;
    }

    async forgotPassword(email){
        const response=await api.post('/auth/forgot-password',{email});
        return response.data;
    }

    async resetPassword(token,newPassword){
        const response=await api.post('auth/reset-password',{token,newPassword});
        return response.data;
    }

    async verifyEmail(token){
        const response=await api.post('auth/verify-email',{token});
        return response.data;
    }

    async resendVerification(email){
        const response=await api.post('auth/send-verification',{email});
        return response.data;
    }

    async getConnectedAccounts(){
        const response=await api.get('/oauth/accounts');
        return response.data.data.accounts;
    }
    async disconnectAccount(provider){
        const response=await api.delete(`/oauth/accounts/${provider}`);
        return response.data;
    }
    googleLogin(){
        window.location.href=`${api.defaults.baseURL}/oauth/google`;
    }
    hackclubLogin(){
        window.location.href=`${api.defaults.baseURL}/oauth/hackclub`;
    }
}

export default new AuthService();