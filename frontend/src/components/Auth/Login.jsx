
import React,{useState} from 'react'
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import Alert from '../Common/Alert';
import authService from '../../services/auth';
const Login = () => {
  return (
    <div>
      <h1>This is a Login Screen</h1>
    </div>
  )
}

export default Login
