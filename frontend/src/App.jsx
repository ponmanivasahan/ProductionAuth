import React from 'react'
import Login from './components/Auth/Login.jsx';
import LoadingSpinner from './components/Common/LoadingSpinner.jsx';
import Alert from './components/Common/Alert.jsx';
const App = () => {
  return (
    <>
    {/* <Login /> */}
    <LoadingSpinner />
    <Alert />
    </>
  )
}

export default App
