import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import FixedCosts from './pages/FixedCosts'
import Categories from './pages/Categories'
import Loans from './pages/Loans'
import LoanDetail from './pages/LoanDetail'
import Navbar from './components/Navbar'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PrivateLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <main className="app-main">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><PrivateLayout><Dashboard /></PrivateLayout></PrivateRoute>} />
      <Route path="/expenses" element={<PrivateRoute><PrivateLayout><Expenses /></PrivateLayout></PrivateRoute>} />
      <Route path="/fixed-costs" element={<PrivateRoute><PrivateLayout><FixedCosts /></PrivateLayout></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><PrivateLayout><Categories /></PrivateLayout></PrivateRoute>} />
      <Route path="/loans" element={<PrivateRoute><PrivateLayout><Loans /></PrivateLayout></PrivateRoute>} />
      <Route path="/loans/:id" element={<PrivateRoute><PrivateLayout><LoanDetail /></PrivateLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
