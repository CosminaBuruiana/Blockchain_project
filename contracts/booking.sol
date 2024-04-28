// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./owner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Booking {
    receive() external payable {}

    Owner public ownerContract;

    struct Hotel {
        uint32 id;
        string location;
        string name;
        uint32 roomsAvailable;
        uint256 pricePerRoom;
    }

    struct Reservation {
        uint32 id;
        uint32 hotelId;
        uint32 numberOfRooms;
    }

    struct Client {
       uint32 id;
       mapping(uint32 => string) status; //the key is the reservation id
    }

    Hotel[] public hotels;
    Reservation[] public reservations;
    mapping(address => Client) public clients;

    modifier onlyOwner {
        require(msg.sender == ownerContract.getOwnerAddress(), "Only hotel owner can perform this action");
        _;
    }

    modifier onlyClient {
        require(msg.sender != ownerContract.getOwnerAddress(), "Only a client can perform this action");
        _;
    }

    event HotelCreated(uint32 id, string location, string name);
    event ReservationMade(uint32 id, uint32 hotelId, uint32 numberOfRooms);
    event ReservationPaid(uint32 id, uint256 totalCost);

    constructor() payable {
		
		address[] memory createdClients = new address[](3);
		
		createdClients[0] = 0x785dA4513e9EE45912dd1546BC7e08915f2D994d;
		createdClients[1] = 0xA67C8516dFf83A32B64fC5CF56CB19d6E9781DEA;
		createdClients[2] = 0x5B97aD8C8A868845405fE6d02BaD7C8539a39C27;

		for (uint32 i = 0; i < createdClients.length; i++) {
			address clientAddress = createdClients[i];
			Client storage client = clients[clientAddress];
			client.id = i;
		}

        hotels.push(Hotel(0, "Craiova", "Ramada", 80, 100000000000000));
        reservations.push(Reservation(0, 0, 5));
        clients[createdClients[0]].status[0] = "UNPAID";
        reservations.push(Reservation(1, 0, 5));
        clients[createdClients[0]].status[1] = "UNPAID";
        reservations.push(Reservation(2, 0, 5));
        clients[createdClients[0]].status[2] = "UNPAID";
    }

     function initialize(address payable ownerContractParam) public {
        require(address(ownerContract) == address(0), "Owner contract has already been initialized");
        ownerContract = Owner(ownerContractParam);
    }

    function getHotels() public view returns(Hotel[] memory) {
        return hotels;
    }

    function createHotel(string memory location, string memory name, uint32 rooms, 
                            uint256 pricePerRoom) public onlyOwner {
         
        uint32 id = uint32(hotels.length);
	    hotels.push(Hotel(id, location, name, rooms, pricePerRoom));
		emit HotelCreated(id, location, name);
    }

    function makeReservation(uint32 hotelId, uint32 numberOfRooms) public onlyClient {
        require(hotels[hotelId].roomsAvailable >= numberOfRooms, "No enought available rooms!");
    //    string memory mes = "Insuffiecient balance! ";
    //    require(0 >= 1, string.concat(string.concat(string.concat(mes, Strings.toStringmsg.sender.balance)), " "), Strings.toString(totalCost)));

        uint32 reservationId = uint32(reservations.length);
        reservations.push(Reservation(reservationId, hotelId, numberOfRooms));
	    hotels[hotelId].roomsAvailable -= numberOfRooms;
        clients[msg.sender].status[reservationId] = "UNPAID";

		emit ReservationMade(reservationId, hotelId, numberOfRooms);
    }

    function payReservation(uint32 reservationId) public payable onlyClient {
        require(msg.sender.balance >= msg.value, "Insuffiecient balance to pay for reservation!");
        clients[msg.sender].status[reservationId] = "PAID";

        //send money from this contract to owner contract
        (bool success, ) = address(ownerContract).call{value: msg.value}("");
        require(success, "Transfer to owner contract failed!");

        emit ReservationPaid(reservationId, msg.value);
    }

    struct ReturnableReservation {
        uint32 id;
        uint32 hotelId;
        string hotelLocation;
        string hotelName;
        uint32 numberOfRooms;
        string status;
        uint256 totalCost;
    }

    struct ReturnableReservationsMapping {
        uint32 numberOfReservations;
        ReturnableReservation[] reservationsList;
    }


    function getReservationsForClient() public view onlyClient returns (ReturnableReservationsMapping memory) {
        ReturnableReservation[] memory returnableReservations = new ReturnableReservation[](100);
        uint32 numOfReservationsForClient = 0;

        for(uint32 i = 0; i < reservations.length; i++) {
            if(keccak256(bytes(clients[msg.sender].status[i]))!= keccak256(bytes(""))) {
                uint32 hotelId = reservations[i].hotelId;
                uint256 totalCost = reservations[i].numberOfRooms * hotels[hotelId].pricePerRoom;

                returnableReservations[numOfReservationsForClient] = ReturnableReservation(i, hotelId,
                                hotels[hotelId].location, hotels[hotelId].name, reservations[i].numberOfRooms, 
                                   clients[msg.sender].status[i], totalCost);

                numOfReservationsForClient++;
            }
        } 
        
        ReturnableReservationsMapping memory reservationsMapping;
        reservationsMapping.numberOfReservations = numOfReservationsForClient;
        reservationsMapping.reservationsList = returnableReservations;

        return reservationsMapping;
    }
}


