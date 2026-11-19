import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './features/shared/Components/Nav.jsx';

const Applayout = () => {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
};

export default Applayout;
