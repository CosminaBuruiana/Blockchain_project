import React from 'react';
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers"
import bookingABI from "../public/artifacts/Booking.json"
import './style/CreateHotel.css';

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
	<div className='wrapper-first'>
    	<div className='wrapper'>
		<h1>Create hotel</h1>
		{
			authenticated()
			&& (
				// <div className="center">
				<form onSubmit={addHotel}>
				
					<div className="input-box">
					<label htmlFor='password'><strong></strong></label>
						<input type="text" required="required" id="location" placeholder='Enter location'/>
						
					</div>
					
					<div className="input-box">
					<label htmlFor='password'><strong></strong></label>
						<input type="text" required="required" id="name" placeholder='Enter name'/>
						
					</div>
					

					<div className="input-box">
					<label htmlFor='password'><strong></strong></label>
						<input type="text" required="required" id="rooms" placeholder='Enter number of rooms'/>
						
					</div>

					<div className="input-box">
					<label htmlFor='password'><strong></strong></label>
						<input type="text" required="required" id="price" placeholder='Enter price' />
					</div>

					
					<button className='btn' type="submit" value="Create"><strong>Create</strong></button>
					
				</form>
			// </div>
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
		</div>
		</div>
    </>
  )
}

export default CreateHotel