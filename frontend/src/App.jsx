import React from 'react'
import Home from './pages/Home'
import Start from './pages/Start'
import UserLogin from './pages/UserLogin'
import UserSignUp from './pages/UserSignUp'
import CaptainHome from './pages/CaptainHome'
import CaptainLogin from './pages/CaptainLogin'
import CaptainSignUp from './pages/CaptainSignUp'

import { Routes, Route } from 'react-router-dom'
import UserProtectedWrapper from './pages/UserProtectedWrapper'
import UserLogout from './pages/UserLogout'
import CaptainProtectedWrapper from './pages/CaptainProtectedWrapper'
import CaptainLogout from './pages/CaptainLogout'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Start></Start>}></Route>

        <Route path="/login" element={<UserLogin />}></Route>

        <Route path="/signup" element={<UserSignUp />}></Route>

        <Route path="/captain-login" element={<CaptainLogin />}></Route>

        <Route path="/captain-signup" element={<CaptainSignUp />}></Route>

        <Route element={<UserProtectedWrapper />}>
          <Route path="/home" element={<Home />} />
          <Route path="/user/logout" element={<UserLogout />} />
          
        </Route>

       <Route element={<CaptainProtectedWrapper />}>
    <Route path="/captain-home" element={<CaptainHome />} />
    <Route path="/captain/logout" element={<CaptainLogout />} />
    {/* <Route path="/captain-profile" element={<CaptainProfile />} />
    <Route path="/captain-settings" element={<CaptainSettings />} /> */}
</Route>

      </Routes>
    </>
  )
}

export default App