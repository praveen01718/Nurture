import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './components/Login'
import Hospital from './components/Hospital'
import Forgot from './components/Forgot'
import ResetPassword from './components/ResetPassword'


const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login/Hospital Admin' element={<Hospital />} />
        <Route path='/login/Hospital Admin/forgot-password' element={<Forgot/>} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default route;
