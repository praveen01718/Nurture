import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './components/Login'
import Hospital from './components/Hospital'
import Forgot from './components/Forgot'
import ResetPassword from './components/ResetPassword'
import ParentList from './components/ParentList'
import AddParent from './components/AddParent'
import Dashboard from './components/Dashboard'
import ChildrenList from './components/ChildrenList'
import AddChild from './components/AddChild'


const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login/Hospital Admin' element={<Hospital />} />
        <Route path='/login/Hospital Admin/forgot-password' element={<Forgot/>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/Home/Dashboard" element={<Dashboard />} />
        <Route path="/Home/Parent" element={<ParentList />} />
        <Route path="/Home/Parents/Add_parent" element={<AddParent/>} />
        <Route path="/Home/children" element={<ChildrenList/>}/>
        <Route path="/Home/children/add_child" element={<AddChild/>}/>
        <Route path="/Home/Children" element={<ChildrenList />} />
        <Route path="/Home/children/add_child" element={<AddChild />} />
      </Routes>
    </BrowserRouter>
  )
}

export default route;
