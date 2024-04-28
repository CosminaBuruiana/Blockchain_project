import React from 'react';
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers"
import bookingABI from "../../artifacts/contracts/booking.sol/Booking.json"

function CreateHotel() {
    const navigate = useNavigate();
    const [blockChainData, setBlockChainData] = useState()
    let bookingContract;
  
    useEffect(() => {
        if(sessionStorage.getItem('blockChainData')) {
            const data = JSON.parse(sessionStorage.getItem('blockChainData'))
            setBlockChainData(() => data)
          }
    }, [])

    const getBookingContract = () => {
        const bookingContractAddress = blockChainData.bookingContractAddress
        const bookingContractABI = bookingABI.abi;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        bookingContract = new ethers.Contract(
            bookingContractAddress,
            bookingContractABI,
            signer
        )
    }

    const addHotel = async(event) => {
      try {
        event.preventDefault();
        getBookingContract();

        const location = document.querySelector("#location").value;
        const name = document.querySelector("#name").value;
        const rooms = document.querySelector("#rooms").value;
        const pricePerRoom = document.querySelector("#price").value;
      
        const transaction = await bookingContract.createHotel(location, name, rooms, pricePerRoom)
        await transaction.wait();
        alert("Hotel creation is successul");
        window.location.reload();
      }
      catch(err) {
        alert("Error adding hotel! Are you owner?");
      }
    }

    const authenticated = () => {
        return (sessionStorage.getItem('blockChainData') != null && sessionStorage.getItem('blockChainData') != undefined)
    }

  return (
    <>
    <p>Create hotel</p>
    {
        authenticated()
        && (
            <div className="center">
              <h4>Create hotel</h4>
         <form onSubmit={addHotel}>
         <div className="inputbox">
            <input type="text" required="required" id="location" />
            <span>Location</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="name" />
            <span>Name</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="rooms" />
            <span>Rooms</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="price" />
            <span>Price</span>
          </div>

          <div className="inputbox">
            <input type="submit" value="Create"/>
          </div>
        </form>
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

export default CreateHotel