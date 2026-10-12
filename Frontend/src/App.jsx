import { BrowserRouter } from 'react-router-dom'
import AllRoutes from './allRoutes.jsx'
import './App.css'
import { useSelector } from 'react-redux'
import { useAuth } from './features/auth/hooks/useAuth.js'
import { useEffect } from 'react'
const App = () => {
  const user = useSelector(state => state.auth.user);
  const {handleGetMe} = useAuth();

  useEffect(() => {
    handleGetMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  console.log(user);
  return (
    <BrowserRouter>
      <AllRoutes />
    </BrowserRouter>
  )
}

export default App