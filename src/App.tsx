import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import RevenuePage from './pages/RevenuePage';
import QRCodesPage from './pages/QRCodesPage';
import ReviewsPage from './pages/ReviewsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { useGetMeQuery } from './store/api/adminAuthApi';
import { setCredentials, logoutUser } from './store/slices/authSlice';
import './App.css';

function App() {
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  // Try to fetch current user if we have a token but not fully authenticated in state
  const { data, error, isLoading } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (data?.admin) {
      dispatch(setCredentials({ admin: data.admin, accessToken: accessToken! }));
    } else if (error) {
      dispatch(logoutUser());
    }
  }, [data, error, dispatch, accessToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route
          path="/forgot-password"
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />}
        />
        
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex font-sans antialiased min-h-screen" style={{ backgroundColor: '#F4F7F4' }}>
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/revenue" element={<RevenuePage />} />
                    <Route path="/qr-codes" element={<QRCodesPage />} />
                    <Route path="/reviews" element={<ReviewsPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
