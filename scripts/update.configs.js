const fs = require('fs');


async function main() {
	frontendArtifactoriesPath = './vite-project/public/artifacts';

	fs.mkdirSync(frontendArtifactoriesPath, { "recursive": true });

	fs.copyFileSync("./cache/deployed.json",
		`${frontendArtifactoriesPath}/deployed.json`);
	fs.copyFileSync("./artifacts/contracts/Owner.sol/Owner.json",
		`${frontendArtifactoriesPath}/Owner.json`);
	fs.copyFileSync("./artifacts/contracts/Booking.sol/Booking.json",
		`${frontendArtifactoriesPath}/Booking.json`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});