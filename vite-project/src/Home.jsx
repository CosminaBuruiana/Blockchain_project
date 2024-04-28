import React from 'react';
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers"
import ownerABI from "../../artifacts/contracts/owner.sol/Owner.json"
import CreateHotel from './CreateHotel';
import HotelsList from './HotelsList';
import ReservationsList from './ReservationsList';


function Home() {
  const navigate = useNavigate();
  const [blockChainData, setBlockChainData] = useState()
  const [ownerContractBalance, setOwnerContractBalance] = useState(0)
  const [isOwner, setIsOwner] = useState(false)
  let ownerContract;
  
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

  const authenticated = () => {
    return (sessionStorage.getItem('blockChainData') != null && sessionStorage.getItem('blockChainData') != undefined)
  }

  return (
    <>
    <p>HOME</p>
    {
      authenticated()
      && (
      <div>
        <HotelsList />
        <button onClick={gotoCreateHotelPage}>Create hotel (only for owner!)</button>
        <button onClick={gotoReservationsPage}>Reservations (only for clients!)</button>
        <button onClick={ownerCashOut}>Cash out (only for owner!)</button>
        <button onClick={getOwnerContractBalance}>Show owner contract balance (only for owner!)</button>
        {
          isOwner && 
          <p>Owner contract balance: {ownerContractBalance.toString()} WEI</p>
        }
        <p>{blockChainData && blockChainData.metamaskAccount}</p>
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