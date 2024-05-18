import React from 'react';
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers"
import ownerABI from "../public/artifacts/Owner.json"
import bookingABI from "../public/artifacts/Booking.json"
import CreateHotel from './CreateHotel';
import HotelsList from './HotelsList';
import ReservationsList from './ReservationsList';
import Navbar from './Navbar';
import './style/Home.css'


function Home() {
  const navigate = useNavigate();
  const [blockChainData, setBlockChainData] = useState()
  const [ownerContractBalance, setOwnerContractBalance] = useState(0)
  const [OwnerAddress, setOwnerAddress] = useState("Show owner address")
  const [isOwner, setIsOwner] = useState(false)
  let ownerContract;
  let bookingContract;
  
  useEffect(() => {
    if(sessionStorage.getItem('blockChainData')) {
      const data = JSON.parse(sessionStorage.getItem('blockChainData'))
      setBlockChainData(() => data)
    }
  }, [])

  const getOwnerContract = (validBlockChainData) => {
    const ownerContractAddress = validBlockChainData.ownerContractAddress
    const ownerContractABI = ownerABI.abi;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    ownerContract = new ethers.Contract(
        ownerContractAddress,
        ownerContractABI,
        signer
    )
}
  const getBookingContract = (validBlockChainData) => {
    const bookingContractAddress = validBlockChainData.bookingContractAddress
    const bookingContractABI = bookingABI.abi;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    bookingContract = new ethers.Contract(
        bookingContractAddress,
        bookingContractABI,
        signer
    )
}

  const gotoCreateHotelPage = () => {
    navigate("/hotel/create")
  }

  const gotoReservationsPage = () => {
    navigate("/reservations")
  }

  const ownerCashOut = async () => {
    getOwnerContract(blockChainData)

    try {
      await ownerContract.payOwner();
      alert("Successfully cashed out for owner!")
    }
    catch(err) {
      console.log(err)
      alert("Error cashing out money for owner!");
    }
  }

  const getOwnerContractBalance = async () => {
      getOwnerContract(blockChainData)

      try {
        const balance = await ownerContract.getBalance()
        setOwnerContractBalance(() => balance)
        setIsOwner(() => true)
        alert("Succesfully retrieved balance for owner contract!");
      }
      catch(err) {
        console.log(err)
        alert("Error getting balance for owner contract! Are you owner?");
      }
  }

  const getOwnerAddress = async () => {
    getBookingContract(blockChainData)

    try {
      const address = await bookingContract.getOwnerAddress()
      setOwnerAddress(address);
      console.log(address);
      return address;
    }
    catch(err) {
      console.log(err)
      alert("Error getting owner adress!");
    }

  }

  const authenticated = () => {
    return (sessionStorage.getItem('blockChainData') != null && sessionStorage.getItem('blockChainData') != undefined)
  }

  return (
    <>
   
    {
      authenticated()
      && (
      
      <div className='home'>
        <Navbar/>
        <div className='div_buttons'>
        <button className='button-88' onClick={gotoCreateHotelPage}>Create hotel (only for owner!)</button>
        <button className='button-88' onClick={gotoReservationsPage}>Reservations (only for clients!)</button>
        <button className='button-88' onClick={ownerCashOut}>Cash out (only for owner!)</button>
        <button className='button-88' onClick={getOwnerContractBalance}>Show owner contract balance (only for owner!)</button>
        </div>
        <HotelsList />
        {
          isOwner && 

          <p>Owner contract balance: {ownerContractBalance.toString()} WEI</p>
        }
        <button className='button-88' onClick={getOwnerAddress}>{OwnerAddress}</button>
        <p>Blockchain Data:</p>
        <p> {blockChainData && blockChainData.metamaskAccount}</p>
        <p>{blockChainData && blockChainData.bookingContractAddress}</p>
        <p>{blockChainData && blockChainData.ownerContractAddress}</p> 
      </div>
      )
    }

    {
      !authenticated()
      && (
      <div>
        <p>You need to be authenticated to access this page!</p>
      </div>
      )
    }
      
      
    </>
  )
}

export default Home