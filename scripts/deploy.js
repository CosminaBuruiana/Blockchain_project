const hre = require("hardhat")

async function main() {
    const Owner = await hre.ethers.getContractFactory("Owner");
    const owner = await Owner.deploy();

    await owner.waitForDeployment();

    const ownerDeploymentAddress = await owner.getAddress();

    console.log("Owner contract deployed at", `${ownerDeploymentAddress}`)

    const Booking = await hre.ethers.getContractFactory("Booking");
    const booking = await Booking.deploy();

    await booking.waitForDeployment();

    const bookingDeploymentAddress = await booking.getAddress();

    console.log("Booking contract deployed at", `${bookingDeploymentAddress}`)

    await booking.initialize(ownerDeploymentAddress);
}

main().catch((error) => {
    console.log(error);
    process.exitCode = 1;
})

//booking local 0x5FbDB2315678afecb367f032d93F642f64180aa3
//owner local 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512


//booking sepolia 0xDaeAc57Bf363e690fE30e688268d271f75b5dEc3
//owner sepolia 0x61825625a76a8CC6714E53850aA6098237192420