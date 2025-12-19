import './App.css'
import { Outlet, RouterProvider, createBrowserRouter, NavLink } from 'react-router-dom';
import NavBar from './components/NavBar';
import { useState } from 'react';
import LoginComponent from './components/LoginComponent';
import Logout from './components/Logout';
import { AuthService } from './services/AuthService';
import { DataService } from './services/DataService';
import CreateRoom from './components/rooms/CreateRoom';
import Rooms from './components/rooms/Rooms';

const authService = new AuthService();
const dataService = new DataService(authService);

function App() {
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const handleSignOut = async () => {
    await authService.logout();
    setUserName(undefined);
    setUserId(undefined);
  };

  const router = createBrowserRouter([
    {
      element: (
        <div className="app-shell">
          <NavBar userName={userName} onSignOut={handleSignOut}/>
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      ),
      children:[
        {
          path: "/",
          element: (
            <div className="page-container">
              <section className="hero">
                <div className="eyebrow">RoomFinder</div>
                <h1 className="hero-title">Find a room you’ll love, or list yours in minutes.</h1>
                <p className="hero-copy">
                  Browse curated rooms, connect directly with owners, and showcase your space with photos and details.
                </p>
                <div className="hero-actions">
                  <NavLink to="/rooms" className="btn-primary">Browse Rooms</NavLink>
                  <NavLink to="/createRoom" className="btn-ghost">List Your Room</NavLink>
                </div>
              </section>

              <section className="feature-grid">
                <div className="card feature">
                  <div className="feature-icon">🔍</div>
                  <div>
                    <h3>Targeted search</h3>
                    <p>Filter by location, size, and essentials so you only see rooms that fit.</p>
                  </div>
                </div>
                <div className="card feature">
                  <div className="feature-icon">🤝</div>
                  <div>
                    <h3>Direct contact</h3>
                    <p>Message owners without middlemen; keep the conversation simple.</p>
                  </div>
                </div>
                <div className="card feature">
                  <div className="feature-icon">🖼️</div>
                  <div>
                    <h3>Rich listings</h3>
                    <p>Photos, amenities, and availability in one clean view for faster decisions.</p>
                  </div>
                </div>
              </section>
            </div>
          ),
        },
        {
          path: "/login",
          element: <LoginComponent authService={authService} setUserNameCb={(name) => { setUserName(name); setUserId(authService.getUserId()); }}/>,
        },
        {
          path: "/profile",
          element: (
            <div className="page-container">
              <div className="card profile-card">
                <p className="eyebrow">Profile</p>
                <h2>Welcome, {userName || 'guest'}!</h2>
                <p className="muted">Manage your account and listings.</p>
                <div className="profile-actions">
                  <NavLink to="/rooms" className="btn-primary">Browse Rooms</NavLink>
                  <NavLink to="/createRoom" className="btn-ghost">Create Listing</NavLink>
                </div>
              </div>
            </div>
          ),
        },
        {
          path: "/logout",
          element: <Logout authService={authService} setUserNameCb={(name) => { setUserName(name); setUserId(undefined); }} />,
        },
        {
          path: "/createRoom",
          element: <CreateRoom dataService={dataService}/>,
        },
        {
          path: "/rooms",
          element: <Rooms dataService={dataService} currentUserId={userId}/>,
        },
      ]
    },
  ]);

  return (
    <RouterProvider router={router} />
  )
};

export default App;
