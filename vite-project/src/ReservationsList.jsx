import React from 'react';
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import bookingABI from "../../artifacts/contracts/booking.sol/Booking.json"
import './style/ReservationList.css';
import Navbar from './Navbar';

function ReservationsList() {

    const [reservations, setReservations] = useState([]);
    const [blockChainData, setBlockChainData] = useState()
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
        bookingContract && retrieveReservations()
    }, [bookingContract])


    const retrieveReservations = async() => {
      try {
        const reservation = await bookingContract.getReservationsForClient();
        const reservationsList = reservation.reservationsList.slice(0, reservation.numberOfReservations)
        setReservations(() => reservationsList)
      }
      catch(err) {
        console.log(err)
        alert("Error retrieving reservations! Are you a client?");
      }
    }

    const pay = async (reservationId, reservationCost) => {
      getBookingContract(blockChainData)

      try {
        await bookingContract.payReservation(reservationId, {
          value: reservationCost, 
          // maxFeePerGas: 2000000000,
          // maxPriorityFeePerGas: 2000000000
        });
        alert("Successfully paid reservation!")
      }
      catch(err) {
        console.log(err)
        alert("Error paying reservation! Do you have enought balance?");
      }
    }

    const authenticated = () => {
        return (sessionStorage.getItem('blockChainData') != null && sessionStorage.getItem('blockChainData') != undefined)
    }

  return (
    <>
    <Navbar/>
    <p>Reservations</p>
    {
        authenticated()
        && (
            <table className='table'>
            <thead>
              <th>Index</th>
              <th>Hotel Id</th>
              <th>location</th>
              <th>Hotel Name</th>
              <th>Number Of Rooms</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </thead>
               <tbody>
                   {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td>{reservation.id}</td>
                          <td>{reservation.hotelId}</td>
                          <td>{reservation.hotelLocation}</td>
                          <td>{reservation.hotelName}</td>
                          <td>{reservation.numberOfRooms}</td>
                          <td>{reservation.status}</td>
                          <td>{reservation.totalCost.toString()}</td>
                          {
                            (reservation.status === "UNPAID") &&
                            <td>
                              <button className='button' onClick={() => pay(reservation.id, reservation.totalCost)}>Pay</button>
                            </td>
                          }
                        </tr>
            ))}
               </tbody>
            </table>
        )}

        {
            !authenticated()
            && (
               <div>
                   <p>You need to be authenticated to access this page!</p>
               </div>
        )}
    </>
  )
}

export default ReservationsList