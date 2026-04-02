import React,{useState,useEffect} from 'react';
const Alert=({type,message,onClose,autoClose=true,duration=5000})=>{
  const [isVisible,setIsVisible]=useState(true);

  useEffect(()=>{
    if(autoClose && onClose){
        const timer=setTimeout(()=>{
            setIsVisible(false);
            onClose();
        },duration);
        return()=>clearTimeout(timer);
    }
  },[autoClose,duration,onClose]);

  if(!isVisible) return null;
    const types={
        success: 'bg-green-100 border-green-500 text-green-700',
        error:'bg-red-100 border-red-500 text-red-700',
        warning:'bg-yellow-100 border-yellow-500 text-yellow-700',
        info:'bg-blue-100 border-blue-500 text-blue-700'
    };

    const icons={
        success:'tick',
        error:'X',
        warning:'warning',
        info:'info'
    };

    return( 
    <div className={`border-l-4 p-4 mb-4 rounded ${types[type]}`} role="alert">
      <div className='flex items-center'>
          <span className='text-xl mr-2'>{icons[type]}</span>
          <span className='flex-1'>{message}</span>
          {onClose &&(
            <button onClick={()=>{
                 setIsVisible(false);
                 onClose();
            }}
            className='ml-4 text-gray-500 hover:text-gray-700'
          > × </button>)}
      </div>
    </div>
    )
}

export default Alert;