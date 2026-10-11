import React from 'react'
import Login from './features/auth/pages/login.jsx'
import { Routes, Route } from 'react-router-dom'
import Home from './features/auth/pages/Home.jsx'
import CreateProduct from './features/products/pages/CreateProduct.jsx'

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/create-product" element={<CreateProduct />} />
      <Route path="/products/create" element={<CreateProduct />} />
      <Route path="/seller/products/create" element={<CreateProduct />} />
    </Routes>
  )
}

export default AllRoutes
