import React from 'react'
import Login from './features/auth/pages/login.jsx'
import { Routes, Route } from 'react-router-dom'
import Home from './features/auth/pages/Home.jsx'
const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default AllRoutes
