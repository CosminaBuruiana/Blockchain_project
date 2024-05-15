const { expect } = require("chai");
const BigNumber  = require('bignumber.js');
const { ethers } = require("hardhat");
// const ethers = require('ethers');

describe("Booking", function ()
{   
    it("getHotels should default configured hotels in booking contract", async function ()
    {
        const BookingFactory = await ethers.getContractFactory("Booking");
        const Booking = await BookingFactory.deploy();
        console.log(`Deployed at address: ${await Booking.getAddress()}`);

        // get default hotels which booking constructor adds
        defaultHotels  = await Booking.getHotels();

        // convert internal format of these to array so we can comapre them
        mappedDefaultHotels = defaultHotels.map(result => Array.from(result))

        // hardcoded for unit test values to expect
        // pay attention, we use BigInts, NOT simple ints, because
        // that's the default type blockchain networks work with
        expectedHotels = [[BigInt(0), 'Craiova', 'Ramada', BigInt(80), BigInt(100000000000000)]];

        // asta e taranism grosolan, dar nu stim ce tip exact ethers api ne intoarce, asa ca 🤷‍♀ :)))
        expect(mappedDefaultHotels.toString() == expectedHotels.toString()).to.be.true;
    });

    it("should create a new hotel", async function ()
    {
        const BookingFactory = await ethers.getContractFactory("Booking");
        const Booking = await BookingFactory.deploy();

        // // Deploying the contract and getting the owner's address
        const [owner] = await ethers.getSigners();
        const ownerAddress = await owner.getAddress();

        // Calculate the price per room in Wei (e.g., 100 Ether)
        const pricePerRoomWei = BigInt("100") * BigInt("10");

        //Call the createHotel function
        await Booking.createHotel("New York", "Hilton", 100, pricePerRoomWei);

        // Get the hotel details
        const hotel = await Booking.hotels(0);

        // Assert the hotel details
        assert.equal(hotel.location, "New York", "Location is incorrect");
        assert.equal(hotel.name, "Hilton", "Name is incorrect");
        assert.equal(hotel.rooms, 100, "Number of rooms is incorrect");
        assert.equal(hotel.pricePerRoom.toString(), pricePerRoomWei.toString(), "Price per room is incorrect");

        // Assert event emitted
        const createHotelEvents = await Booking.queryFilter("HotelCreated");
        assert.equal(createHotelEvents.length, 1, "HotelCreated event not emitted");
        assert.equal(createHotelEvents[0].args.id.toNumber(), 0, "Hotel ID is incorrect");
        assert.equal(createHotelEvents[0].args.location, "New York", "Location in event is incorrect");
        assert.equal(createHotelEvents[0].args.name, "Hilton", "Name in event is incorrect");
    });

    // it("should pay for a reservation", async function () {
    //     // Deploy the Booking contract
    //     const BookingFactory = await ethers.getContractFactory("Booking");
    //     const Booking = await BookingFactory.deploy();
    //     console.log(`Deployed at address: ${await Booking.getAddress()}`);
    
    //     // Mock owner contract address
    //     const ownerContract = Booking.getAddress(); // Replace with actual owner contract address
    
    //     // Mock reservation ID
    //     const reservationId = 0;
    
    //     // Add funds to the client for testing
    //     const [owner, client] = await ethers.getSigners();
    //     await client.sendTransaction({
    //         to: client.address,
    //         value: ethers.utils.parseEther("1") // Sending 1 Ether to the client
    //     });
    
    //     // Pay for a reservation
    //     const reservationValue = ethers.utils.parseEther("0.5"); // Assuming reservation costs 0.5 Ether
    //     await Booking.connect(client).payReservation(reservationId, { value: reservationValue });
    
    //     // Check client's reservation status
    //     const clientStatus = await Booking.clients(client.address).status(reservationId);
    //     expect(clientStatus).to.equal("PAID");
    
    //     // Check if funds were transferred to owner contract
    //     const ownerBalanceBefore = await ethers.provider.getBalance(ownerContract);
    //     expect(ownerBalanceBefore).to.equal(reservationValue);
    
    //     // Check event emitted
    //     const reservationPaidEvents = await Booking.queryFilter("ReservationPaid");
    //     expect(reservationPaidEvents.length).to.equal(1);
    //     expect(reservationPaidEvents[0].args.reservationId).to.equal(reservationId);
    //     expect(reservationPaidEvents[0].args.value).to.equal(reservationValue);
    // });

    // it("should make a reservation", async function () {
    //     const BookingFactory = await ethers.getContractFactory("Booking");
    //     const Booking = await BookingFactory.deploy();
    //     console.log(`Deployed at address: ${await Booking.getAddress()}`);
    
    //     // Mock hotel ID and number of rooms
    //     const hotelId = 0; // Assuming hotel ID 0
    //     const numberOfRooms = 2; // Assuming booking 2 rooms
    
    //     // Mock hotel availability
    //     await Booking.createHotel("New York", "Hilton", 10, ethers.utils.parseEther("100")); // Create a hotel with 10 rooms
    
    //     // Make a reservation
    //     await Booking.connect(client).makeReservation(hotelId, numberOfRooms);
    
    //     // Check hotel availability after reservation
    //     const hotel = await Booking.hotels(hotelId);
    //     expect(hotel.roomsAvailable).to.equal(8); // 10 - 2 = 8 rooms available
    
    //     // Check client's reservation status
    //     const reservationId = 0; // Assuming first reservation ID
    //     const clientStatus = await Booking.clients(client.address).status(reservationId);
    //     expect(clientStatus).to.equal("UNPAID");
    
    //     // Check event emitted
    //     const reservationMadeEvents = await Booking.queryFilter("ReservationMade");
    //     expect(reservationMadeEvents.length).to.equal(1);
    //     expect(reservationMadeEvents[0].args.reservationId).to.equal(reservationId);
    //     expect(reservationMadeEvents[0].args.hotelId).to.equal(hotelId);
    //     expect(reservationMadeEvents[0].args.numberOfRooms).to.equal(numberOfRooms);
    // });

    // it("should return reservations for a client", async function () {
    //     const BookingFactory = await ethers.getContractFactory("Booking");
    //     const Booking = await BookingFactory.deploy();
    //     console.log(`Deployed at address: ${await Booking.getAddress()}`);
    
    //     // Mock hotel and reservation data
    //     await Booking.createHotel("New York", "Hilton", 10, ethers.utils.parseEther("100")); // Create a hotel
    //     await Booking.connect(client).makeReservation(0, 2); // Make a reservation for the client
    
    //     // Get reservations for the client
    //     const reservationsMapping = await Booking.connect(client).getReservationsForClient();
    
    //     // Check the number of reservations returned
    //     expect(reservationsMapping.numberOfReservations).to.equal(1);
    
    //     // Check reservation details
    //     const reservation = reservationsMapping.reservationsList[0];
    //     expect(reservation.reservationId).to.equal(0); // Assuming first reservation ID
    //     expect(reservation.hotelId).to.equal(0); // Assuming first hotel ID
    //     expect(reservation.location).to.equal("New York");
    //     expect(reservation.name).to.equal("Hilton");
    //     expect(reservation.numberOfRooms).to.equal(2);
    //     expect(reservation.status).to.equal("UNPAID"); // Assuming status is "UNPAID"
    //     expect(reservation.totalCost).to.equal(ethers.utils.parseEther("200")); // Assuming total cost for 2 rooms is 200 Ether
    // });
});
