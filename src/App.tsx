import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthLayout from './layouts/AuthLayout'
import NotFound from './layouts/NotFound'
import { LoginForm } from './pages/Auth/login-form'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home/home'

function App() {
 
  return (
    <BrowserRouter>
    {/*Auth routes */}
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>
      {/*home routes */}
      <Route element= {<MainLayout/>}>
      <Route path='/home' element={<Home/>}/>
       </Route>

      {/*404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
