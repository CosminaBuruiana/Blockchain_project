const Strings       = artifacts.require('Strings');
const Owner         = artifacts.require('Owner');
const Booking       = artifacts.require('Booking');
const truffleAssert = require('truffle-assertions');
const BigNumber     = require('bignumber.js');

const constants         = require('./utils/constants');
const increaseTime      = require('./utils/increaseTime');
const getBlockTimestamp = require('./utils/getBlockTimestamp');
const assert            = require('assert');


function calculateGasCostInWei(receipt)
{
	// Extract relevant data from the receipt
	const gasUsed = BigNumber(receipt.cumulativeGasUsed);
	const effectiveGasPrice = BigNumber(receipt.effectiveGasPrice);
  
	// Calculate total gas cost in Wei
	const totalGasCostInWei = gasUsed * effectiveGasPrice;
  
	return totalGasCostInWei;
}


contract('Booking', ([owner, wallet, anotherAccount]) =>
{
	let contractOwner;
	let contractBooking;

	before(async () => {
		web3.eth.defaultAccount = owner;

		libraryStrings = await Strings.new();
		Booking.link(libraryStrings);
	});

	beforeEach(async () =>
	{
		contractOwner = await Owner.new();
		contractBooking = await Booking.new();

		await contractBooking.initialize(contractOwner.address);
	});


	describe('Testing good functionality', () =>
	{
		it('Check owner initialization work', async () =>
		{
		    const ownerAddress = await contractBooking.getOwnerAddress();
		    assert.equal(ownerAddress, owner);
		});

		it("getHotels should default configured hotels in booking contract", async () =>
		{
			// get default hotels which booking constructor adds
			defaultHotels = await contractBooking.getHotels();

			// convert internal format of these to array so we can comapre them
			mappedDefaultHotels = defaultHotels.map(result => Array.from(result));

			// hardcoded for unit test values to expect
			// pay attention, we use BigInts, NOT simple ints, because
			// that's the default type blockchain networks work with
			expectedHotels = [[BigInt(0).toString(), 'Craiova', 'Ramada', BigInt(80).toString(), BigInt(100000000000000).toString()]];

			// asta e taranism grosolan, dar nu stim ce tip exact ethers api ne intoarce, asa ca 🤷‍♀ :)))
			assert.equal(mappedDefaultHotels.toString(), expectedHotels.toString());
		});

		it("Should create a new hotel", async function ()
		{
			// Calculate the price per room in Wei (e.g., 100 Ether)
			const pricePerRoomWei = BigInt("12345678901234567890123456789012345678901234567890");

			// Call the createHotel function
			const resultTx = await contractBooking.createHotel("New York", "Hilton", 100, pricePerRoomWei, {
				from: owner
			});

			// Get the hotel details
			const hotels = await contractBooking.getHotels();
			const insertedHotel = hotels[1];

			// Assert the hotel details
			assert.equal(insertedHotel.id, "1", "Id is incorrect");
			assert.equal(insertedHotel.location, "New York", "Location is incorrect");
			assert.equal(insertedHotel.name, "Hilton", "Name is incorrect");
			assert.equal(insertedHotel.roomsAvailable, 100, "Number of rooms is incorrect");
			assert.equal(insertedHotel.pricePerRoom, pricePerRoomWei.toString(), "Price per room is incorrect");

			// Assert event emitted
			truffleAssert.eventEmitted(resultTx, 'HotelCreated', (event) => {
					return BigNumber(event.id).isEqualTo("1") &&
							event.location == "New York" &&
							event.name     == "Hilton";
			});
		});

		it("Should allow the client to pay for a reservation", async () =>
		{
			const hotelId = 0, numberOfRooms = 2, initialBalance = await web3.eth.getBalance(anotherAccount);

			// Make the reservation
			const resultTxReservation = await contractBooking.makeReservation(hotelId, numberOfRooms, {
				from: anotherAccount
			});

			const reservationId = resultTxReservation.logs[0].args.id.toNumber();
			const pricePerRooms = numberOfRooms * await contractBooking.getPricePerRoom(hotelId);

			const statusBeforePay = await contractBooking.getReservationStatus(reservationId, { from: anotherAccount });
			assert(statusBeforePay == 'UNPAID');

			// Assert event emitted
			truffleAssert.eventEmitted(resultTxReservation, 'ReservationMade', (event) => {
				return event.id == reservationId &&
					   event.hotelId == hotelId &&
					   event.numberOfRooms == numberOfRooms;
			});
				
			// Pay for the reservation
			const resultTxPay = await contractBooking.payReservation(reservationId, {
				from: anotherAccount,
				value: pricePerRooms,
			});

			const statusAfterPay = await contractBooking.getReservationStatus(reservationId, { from: anotherAccount });
			assert(statusAfterPay == 'PAID');

			const afterPayBalance = await web3.eth.getBalance(anotherAccount);
			assert(initialBalance - pricePerRooms >= afterPayBalance);

			// Assert event emitted
			truffleAssert.eventEmitted(resultTxPay, 'ReservationPaid', (event) => {
				return event.id == reservationId &&
					   BigNumber(event.totalCost).isEqualTo(pricePerRooms);
			});
		});

		it('Check owner can get his money', async () =>
		{
			// Simulate some payments:
			const hotelId = 0, numberOfRooms = 2, initialBalance = await web3.eth.getBalance(anotherAccount);

			const resultTxReservation = await contractBooking.makeReservation(hotelId, numberOfRooms, {
				from: anotherAccount
			});

			const reservationId = resultTxReservation.logs[0].args.id.toNumber();
			const pricePerRooms = BigNumber(numberOfRooms) * BigNumber(await contractBooking.getPricePerRoom(hotelId));

			const resultTxPay = await contractBooking.payReservation(reservationId, {
				from: anotherAccount,
				value: pricePerRooms,
			});

			// Owner get his money back:
			const initialOwnerContractBalance = BigNumber(await contractOwner.getBalance());
			const initialOwnerBalance = BigNumber(await web3.eth.getBalance(owner));

			const resultTx = await contractOwner.payOwner();
			
			const gasFees = calculateGasCostInWei(resultTx.receipt);
			const afterPaymentsOwnerContractBalance = BigNumber(await contractOwner.getBalance());
			const afterPaymentsOwnerBalance = BigNumber(await web3.eth.getBalance(owner));

			assert(initialOwnerContractBalance == pricePerRooms);
			assert(afterPaymentsOwnerContractBalance.isEqualTo(0));

			// console.log(initialOwnerBalance.toString());
			// console.log(pricePerRooms.toString());
			// console.log(gasFees.toString());
			// console.log(afterPaymentsOwnerBalance.toString());
		});
	});

	describe('Testing revert functionality', () =>
	{
		it("Client shouldn't pay less for a reservation", async () =>
		{
			const hotelId = 0, numberOfRooms = 3, initialBalance = await web3.eth.getBalance(anotherAccount);
	
			// Make the reservation
			const resultTxReservation = await contractBooking.makeReservation(hotelId, numberOfRooms, {
				from: anotherAccount
			});
	
			const reservationId = resultTxReservation.logs[0].args.id.toNumber();
			const tryPayOnlyOneRoom = await contractBooking.getPricePerRoom(hotelId);
	
			// Try fraud pay for the reservation
			const resultTxPromise = contractBooking.payReservation(reservationId, {
				from: anotherAccount,
				value: tryPayOnlyOneRoom,
			});

			await truffleAssert.reverts(resultTxPromise);
		});

		it('Check only owner can get his money', async () =>
		{
			const resultTxPromise = contractOwner.payOwner({ from: anotherAccount });

			await truffleAssert.reverts(resultTxPromise);
		});
	});
});