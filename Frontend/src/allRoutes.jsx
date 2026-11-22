import Login from './features/auth/pages/login.jsx';
import { Routes, Route } from 'react-router-dom';
import Home from './features/auth/pages/Home.jsx';
import CreateProduct from './features/products/pages/CreateProduct.jsx';
import Dashboard from './features/products/pages/Dashboard.jsx';
import Protected from './features/components/Protected.jsx';
import ProductDetail from './features/products/pages/ProductDetail.jsx';
import SellerProductDetails from './features/products/pages/SellerProductDetails.jsx';
import Cart from './features/cart/pages/Cart.jsx';
import Applayout from './Applayout.jsx';
import NotFound from './features/shared/pages/NotFound.jsx';

const AllRoutes = () => {
  return (
    <Routes>
      {/* Shared Applayout containing Nav & child routes via Outlet */}
      <Route element={<Applayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route
          path="/cart"
          element={
            <Protected>
              <Cart />
            </Protected>
          }
        />
        {/* Wildcard route for 404 / not found */}
        <Route path="*" element={<NotFound />} />
      </Route>

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
      <Route
        path="/seller/product/:productId"
        element={
          <Protected role="seller">
            <SellerProductDetails />
          </Protected>
        }
      />
    </Routes>
  );
};

export default AllRoutes;
