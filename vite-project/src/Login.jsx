import React from 'react';
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers"

import bookingABI from "../public/artifacts/Booking.json"
import ownerABI from "../public/artifacts/Owner.json"
import ArtifactsData from "../public/artifacts/deployed.json" 
import CreateHotel from './CreateHotel';
import HotelsList from './HotelsList';
import Navbar from './Navbar.jsx';
import './style/Login.css'

function Login() {
  const navigate = useNavigate();
  const [metamaskAccount, setMetamaskAccount] = useState("Not connected");

  const bookingContractAddress = ArtifactsData.address_booking;
  const bookingContractABI = bookingABI.abi;
  
  const ownerContractAddress = ArtifactsData.address_owner;
  const ownerContractABI = ownerABI.abi;

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
    
  const bookingContract = new ethers.Contract(
      bookingContractAddress,
      bookingContractABI,
      signer
  )
    
   const ownerContract = new ethers.Contract(
        ownerContractAddress,
        ownerContractABI,
        signer
   )
  
  const connect = async () => {
    try {
        const { ethereum } = window;
        const account = await ethereum.request({
            method: "eth_requestAccounts"
        })
    
        window.ethereum.on("accountsChanged", ()=>{
            window.location.reload()
        })
    
        await setMetamaskAccount(account)
    
        const blockChainData = {
            metamaskAccount: account,
            bookingContractAddress: bookingContractAddress,
            ownerContractAddress: ownerContractAddress
        }
   
        sessionStorage.setItem('blockChainData', JSON.stringify(blockChainData));
        navigate("/home");
        }
        catch(err) {
          console.log(err);
        }
    }

  return (
    <>
   
    <div className='hero-container'>
    <p>Connected account: {metamaskAccount}</p>
    <div className='hero-btns'>
    <button className="button" onClick={connect}>Connect with MetaMask</button>
    </div>
    </div>
    </>
  

  )
}

export default Login
