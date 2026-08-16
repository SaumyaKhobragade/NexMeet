import './App.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';

import LandingPage from './pages/landing';
// import Authentication from './pages/authentication';
// import VideoMeetComponent from './pages/VideoMeet';
// import HomeComponent from './pages/home';
// import History from './pages/history';

// import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <>
      <BrowserRouter>
        {/* <AuthProvider> */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* <Route path="/auth" element={<Authentication />} /> */}
            {/* <Route path="/:url" element={<VideoMeetComponent />} /> */}
            {/* <Route path="/home" element={<HomeComponent />} /> */}
            {/* <Route path="/history" element={<History />} /> */}
          </Routes>
        {/* </AuthProvider> */}
      </BrowserRouter>
    </>
  )
}

export default App;
