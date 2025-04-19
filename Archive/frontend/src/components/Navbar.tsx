import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav style={{ padding: '1rem', background: '#eee', marginBottom: '1rem' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/tasks" style={{ marginRight: '1rem' }}>Tasks</Link>
      <Link to="/login">Login</Link>
      {/* Add other navigation links, user info, logout button etc. */}
    </nav>
  );
};

export default Navbar;
