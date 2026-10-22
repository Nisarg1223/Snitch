import Login from './features/auth/pages/login.jsx'
import { Routes, Route } from 'react-router-dom'
import Home from './features/auth/pages/Home.jsx'
import CreateProduct from './features/products/pages/CreateProduct.jsx'
import Dashboard from './features/products/pages/Dashboard.jsx'
import Protected from './features/components/Protected.jsx'
import ProductDetail from './features/products/pages/ProductDetail.jsx'

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <Protected role="seller">
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/seller/dashboard"
        element={
          <Protected role="seller">
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/create-product"
        element={
          <Protected role="seller">
            <CreateProduct />
          </Protected>
        }
      />
      <Route
        path="/products/create"
        element={
          <Protected role="seller">
            <CreateProduct />
          </Protected>
        }
      />
      <Route
        path="/seller/products/create"
        element={
          <Protected role="seller">
            <CreateProduct />
          </Protected>
        }
      />
      <Route path="/product/:productId" element={<ProductDetail />} />
    </Routes>
  )
}

export default AllRoutes
