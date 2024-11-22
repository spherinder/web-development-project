import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchHelloWorld } from './api';

function App() {
  const {status, data, error} = useQuery({queryKey: ["helloWorld"], queryFn: fetchHelloWorld})
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <h3>Let's see if server's '/' endpoint responds here:</h3>

        <p>{data}</p>

        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
