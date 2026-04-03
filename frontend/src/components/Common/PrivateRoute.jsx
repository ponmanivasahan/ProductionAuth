import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute=({children,roles=[]})=>{
    const {user,isAuthenticated,loading}=useAuth();
    const location = useLocation();

    if(loading){
        return <LoadingSpinner />
    }

    if(!isAuthenticated){
        return <Navigate to="/login" replace />
    }

    if(roles.length>0 && !roles.some(role=> user?.roles?.includes(role))){
        return <Navigate to="/dashboard" replace />
    }
    return children;
}

export default PrivateRoute;