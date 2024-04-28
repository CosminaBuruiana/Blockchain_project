import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home.jsx'
import Login from './Login.jsx';
import './index.css'
import CreateHotel from './CreateHotel.jsx';
import ReservationsList from './ReservationsList.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="home" element={<Home />} />
          <Route path="hotel/create" element={<CreateHotel />} />
          <Route path="reservations" element={<ReservationsList />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
