import Login from './features/auth/pages/login.jsx'
import { Routes, Route } from 'react-router-dom'
import Home from './features/auth/pages/Home.jsx'
import CreateProduct from './features/products/pages/CreateProduct.jsx'
import Dashboard from './features/products/pages/Dashboard.jsx'
import Protected from './features/components/Protected.jsx'

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/seller/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/create-product"
        element={
          <Protected>
            <CreateProduct />
          </Protected>
        }
      />
      <Route
        path="/products/create"
        element={
          <Protected>
            <CreateProduct />
          </Protected>
        }
      />
      <Route
        path="/seller/products/create"
        element={
          <Protected>
            <CreateProduct />
          </Protected>
        }
      />
    </Routes>
  )
}

export default AllRoutes
