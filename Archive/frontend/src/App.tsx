import React from 'react';
import './App.css'; // Optional: default CRA styles

function App() {
  console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL); // Verify env var
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Task Manager</h1>
        <p>Loading...</p> {/* Placeholder content */}
      </header>
    </div>
  );
}

export default App;
