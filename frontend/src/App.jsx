import './App.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';

import LandingPage from './pages/Landing';
import Authentication from './pages/Authentication';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/Home';
import History from './pages/History';

import { AuthProvider } from './contexts/AuthContext.jsx';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/:url" element={<VideoMeetComponent />} />
            <Route path="/home" element={<HomeComponent />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App;
