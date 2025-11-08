import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthLayout from './layouts/AuthLayout'
import NotFound from './layouts/NotFound'
import { LoginForm } from './pages/Auth/login-form'

function App() {
 
  return (
    <BrowserRouter>
    {/*Auth routes */}
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>
      {/*404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
