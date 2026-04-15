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
import AddMeasurement from './components/AddMeasurement'
import AddVaccination from './components/AddVaccination'
import VaccinationSchedule from './components/VaccinationSchedule'

const route = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login/Hospital Admin' element={<Hospital />} />
        <Route path='/login/Hospital Admin/forgot-password' element={<Forgot/>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/Home/dashboard" element={<Dashboard />} />
        <Route path="/Home/parent" element={<ParentList />} />
        <Route path="/Home/parents/add_parent" element={<AddParent/>} />
        <Route path="/Home/children" element={<ChildrenList />} />
        <Route path="/Home/children/add_child" element={<AddChild />} />
        <Route path="/Home/children/:childId/add_measurement" element={<AddMeasurement />} />
        <Route path="/Home/children/:childId/add_vaccination" element={<AddVaccination />} />
        <Route path="/Home/vaccination" element={<VaccinationSchedule />} />
        <Route path="/Home/vaccination/upcoming" element={<VaccinationSchedule />} />
        <Route path="/Home/vaccination/missed" element={<VaccinationSchedule />} />

      </Routes>
    </BrowserRouter>
  )
}

export default route;
