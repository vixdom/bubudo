import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-gray-500 text-sm">
        <p>AI Task Manager &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;
