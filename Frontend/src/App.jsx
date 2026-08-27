import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AllRoutes from './allRoutes.jsx'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <AllRoutes />
    </BrowserRouter>
  )
}

export default App