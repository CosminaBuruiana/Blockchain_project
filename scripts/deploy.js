const fs = require('fs');


function writeData(Booking_data) {
	const data = JSON.stringify(Booking_data, null, 2);

	fs.writeFileSync('./cache/deployed.json', data, (err) => {
    	if (err)
			throw err;
	});
}

async function main()
{
	const StringsFactory = await ethers.getContractFactory("Strings");
    const Strings = await StringsFactory.deploy();

	const OwnerFactory = await ethers.getContractFactory("Owner");
    const Owner = await OwnerFactory.deploy();

	console.log('Owner deployed to:', Owner.address);

	const BookingFactory = await ethers.getContractFactory('Booking', {
		libraries: {
			Strings: Strings.address
		}
	});
	const Booking = await BookingFactory.deploy();

	await Booking.deployed();
	await Booking.initialize(Owner.address);

	console.log('Booking deployed to:', Booking.address);

	writeData({
		"network_id": network.config.network_id,
		"network_name": network.name,
		"url": network.config.url,
		"address_booking": Booking.address,
		"address_owner": Owner.address 
	})
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});