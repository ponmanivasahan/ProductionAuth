import React, {createContext,useState,useEffect,useContext} from 'react';
import authService from '../services/auth';
import api from '../services/api';

const AuthContext=createContext();
export const useAuth=()=>{
        const context=useContext(AuthContext);
        if(!context){
            throw new Error ('useAuth must be used within AuthProvider');
        }
        return context;
}

export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);
    
    useEffect(()=>{
        loadUser();
    },[]);
    
    useEffect(()=>{
        const urlParams=new URLSearchParams(window.location.search);
        const token=urlParams.get('token');
        const isNew=urlParams.get('new')==='true';

        if(token){
            localStorage.setItem('accessToken',token);
            window.history.replaceState({},document.title,window.location.pathname);
            loadUser();

            if(isNew){
                setError('Welcome! Your account has been created');
            }
        }
    },[]);

    const loadUser=async()=>{
        try{
            setLoading(true);
            const storedUser=localStorage.getItem('user');
            if(storedUser && ! user){
                setUser(JSON.parse(storedUser));
            }

            const userData=await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user',JSON.stringify(userData));
            setError(null);
        }
        catch(err){
              console.error('Failed to load user', err);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('user');
              setUser(null);
        }
        finally{
            setLoading(false);
        }
    }
    const login= async(email,password)=>{
        try{
          setError(null);
          const response=await authService.login(email,password);
          setUser(response.data.user);
          return response;
        }
        catch(err){
          setError(err.response?.data?.message || 'Login failed');
          throw err;
        }
    }

    const register=async(email,password)=>{
        try{
            setError(null);
            const response=await authService.register(email,password);
            setUser(response.data.user);
            return response;
        }
        catch{
          setError(err.response?.data?.message || 'Registration failed');
          throw err;
        }
    }

    const logout= async()=>{
        try{
            await authService.logout();
        }
        finally{
            setUser(null);
            setError(null);
        }
    };

    const forgotPassword=async(email)=>{
        try{
            setError(null);
            const response=await authService.forgotPassword(email);
            return response;
        }
        catch(err){
           setError(err.response?.data?.message || 'Failed to send reset email');
           throw err;
        }
    }
   
    const resetPassword=async(token,newPassword)=>{
        try{
            setError(null);
            const response=await authService.resetPassword(token,newPassword);
            return response;
        }
        catch(err){
            setError(err.response?.data?.message || 'Failed to reset password');
            throw err;
        }
    }

    const verifyEmail=async(token)=>{
        try{
            setError(null);
            const response=await authService.verifyEmail(token);
            if(response.success){
                if(user){
                    setUser({...user,is_email_verified:true});
                    localStorage.setItem('user',JSON.stringify({...user,is_email_verified:true}))
                }
            }
            return response;
        }
        catch(err){
           setError(err.response?.data?.message || 'Failed to verify email');
           throw err;
        }
    }

    const resendVerification= async (email)=>{
        try{
           setError(null);
           const response=await authService.resendVerification(email);
           return response;
        }
        catch(err){
            setError(err.response?.data?.message || 'Failed to resend verification');
            throw err;
        }
    }



    const value={user,loading,error,isAuthenticated: !!user,isAdmin:user?.roles?.includes('admin'),
        login,register,logout,forgotpassword,resetPassword,verifyEmail,resendVerification,loadUser,
    };

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}