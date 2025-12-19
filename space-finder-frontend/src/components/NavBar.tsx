import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

type NavBarProps = {
  userName: string | undefined;
  onSignOut: () => Promise<void>;
};
export default function NavBar({ userName, onSignOut }: NavBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await onSignOut();
    setDropdownOpen(false);
    navigate("/");
  };

  function renderLoginLogout() {
    if (userName) {
      return (
        <div className="user-menu">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="user-chip"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <span className="avatar">{userName.slice(0, 1).toUpperCase()}</span>
            <span className="user-name">{userName}</span>
            <span className={`chevron ${dropdownOpen ? 'open' : ''}`}>▾</span>
          </button>
          {dropdownOpen && (
            <div className="dropdown">
              <NavLink 
                to="/profile" 
                onClick={() => setDropdownOpen(false)}
                className="dropdown-item"
              >
                Profile
              </NavLink>
              <button 
                type="button" 
                onClick={handleSignOut}
                className="dropdown-item danger"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <NavLink to="/login" className="btn-primary ghost">
          Sign in
        </NavLink>
      );
    }
  }

  return (
    <header className="navbar">
      <div className="page-container navbar-inner">
        <NavLink to={"/"} className="brand">
          <span className="logo-dot" aria-hidden="true"></span>
          <span className="brand-name">RoomFinder</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to={"/"} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to={"/rooms"} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Browse Rooms</NavLink>
          <NavLink to={"/createRoom"} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>List Room</NavLink>
        </nav>
        <div className="nav-actions">
          {renderLoginLogout()}
        </div>
      </div>
    </header>
  );
}
