import React from 'react';
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import bookingABI from "../../artifacts/contracts/booking.sol/Booking.json"
import "./style/HotelList.css";


function HotelsList() {

    const [hotels, setHotels] = useState([]);
    const [blockChainData, setBlockChainData] = useState()
    const [roomsToReserve, setRoomsToReserve] = useState(0)
    let bookingContract;

    useEffect(() => {
        if(sessionStorage.getItem('blockChainData')) {
            const data = JSON.parse(sessionStorage.getItem('blockChainData'))
            setBlockChainData(() => data)
            getBookingContract(data)
          }
    }, [])

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

    useEffect(() => {
        bookingContract && retrieveHotels()
    }, [bookingContract])


    const retrieveHotels = async() => {
      const hotelsList = await bookingContract.getHotels();
      setHotels(() => hotelsList)
    }

    const reserve = async (hotel) => {
      getBookingContract(blockChainData)

      try {
        await bookingContract.makeReservation(hotel.id, roomsToReserve);
        alert("Successfully made reservation!")
      }
      catch(err) {
        console.log(err)
        alert("Error making reservation! Are you a client? Are enought free rooms? Do you have enought balance? ");
      }
    }

  return (
    <>
    <table className='table'>
    <thead>
        <tr>
					<th>Index</th>
          <th>Name</th>
          <th>Location</th>
					<th>Hotel name</th>
          <th>Rooms available</th>
					<th>Price</th>
          <th>Set rooms to reserve</th>
          <th>Reserve</th>
				</tr>
		</thead>
    <tbody>
    {hotels.map((hotel) => (
      <tr key={hotel.id}>
        <td>{hotel.id}</td>
        <td>{hotel.name}</td>
        <td>{hotel.location}</td>
        <td>{hotel.name}</td>
        <td>{hotel.roomsAvailable}</td>
        <td>{hotel.pricePerRoom.toString()}</td>
        <td>
          <input
            type="number"
            value={roomsToReserve}
            onChange={(event) => setRoomsToReserve(() => event.target.value)}
          />
        </td>
        <td>
          <button className='button' onClick={() => reserve(hotel)}>Reserve (only for clients!)</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </>
  )
}

export default HotelsList