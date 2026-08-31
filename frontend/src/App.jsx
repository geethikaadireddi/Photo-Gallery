import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AlbumView from './pages/AlbumView';
import SharedAlbum from './pages/SharedAlbum';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/albums/:id"
            element={
              <ProtectedRoute>
                <AlbumView />
              </ProtectedRoute>
            }
          />
          <Route path="/shared/:accessCode" element={<SharedAlbum />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;