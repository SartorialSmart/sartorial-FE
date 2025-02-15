import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRegister from './pages/Auth/AdminRegister';
// import Dashboard from './pages/Dashboard';
// import Login from './pages/Auth/AdminLogin';
import ProtectedRoute from '../utils/ProtectedRoutes'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/register" element={<AdminRegister />} />
        
        {/* Protected Route for Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {/* <Dashboard /> */}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
