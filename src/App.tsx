import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from "./pages/Login"
import ForemanPortal from "./pages/ForemanPortal"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/foreman" element={<ForemanPortal />} />
      </Routes>
    </BrowserRouter>
  )
}
