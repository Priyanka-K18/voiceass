import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

// Voice Assistant
import VoiceController from './components/VoiceController';
import { handleVoiceCommand } from './utils/handleVoiceCommand';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-black text-white'
          : 'bg-gray-50 text-gray-900'
      } transition-colors duration-300 font-sans`}
    >

      {/* Dynamic Background */}
      {isDark && (
        <>
          <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {!isLoginPage && user ? (
        <div className="flex h-screen overflow-hidden">

          {/* Sidebar */}
          <Sidebar />

          <div className="flex-1 flex flex-col relative z-10 overflow-hidden">

            {/* Topbar */}
            <Topbar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">

              {/* Floating Voice Assistant */}
              <div className="fixed bottom-10 right-10 z-50">
                <VoiceController />
              </div>

              {/* Routes */}
              <Routes>

                <Route
                  path="/"
                  element={
                    <Navigate
                      to="/dashboard"
                      replace
                    />
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute
                      roles={['Owner', 'Manager']}
                    >
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute>
                      <Inventory />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/billing"
                  element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute
                      roles={['Owner', 'Manager']}
                    >
                      <Customers />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute
                      roles={['Owner']}
                    >
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/dashboard"
                      replace
                    />
                  }
                />

              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
        </Routes>
      )}

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
      />
    </div>
  );
}

export default App;