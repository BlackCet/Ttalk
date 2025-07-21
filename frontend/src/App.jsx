import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Users from './pages/Users';
import ChatWrapper from './pages/ChatWrapper';
import ProtectedRoute from './components/ProtectedRoute';
import OAuthSuccess from './components/OAuthSuccess'; 
import CompleteProfile from './components/CompleteProfile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />


      <Route path="/oauth-success" element={<OAuthSuccess />} /> 
  <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatWrapper />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;