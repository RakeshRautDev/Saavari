import React from 'react'
import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserSignUp from './pages/UserSignUp'
import CaptainLogin from './pages/CaptainLogin'
import CaptainSignUp from './pages/CaptainSignUp'
import { Routes,Route } from 'react-router-dom'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        
        <Route path="/login" element={<UserLogin/>}></Route>

        <Route path="/signup" element={<UserSignUp/>}></Route>

        <Route path="/captain-login" element={<CaptainLogin/>}></Route>

        <Route path="/captain-signup" element={<CaptainSignUp/>}></Route>

      </Routes>
    </>
  )
}

export default App