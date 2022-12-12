import './App.css';
import React from 'react'
import {
  Route,
  Routes
} from "react-router-dom";
import Home from './pages/Home';
import Chatpage from './pages/Chat';
import Notification from './components/miscellaneous/Notification';

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path="/" element={<Home />}>
        </Route>
        <Route path="/chat" element={<Chatpage />}>
        </Route>
        <Route path="/ran" element={<Notification />}>
        </Route>
      </Routes>
    </div>
);
}

export default App;
