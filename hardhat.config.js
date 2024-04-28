require("@nomicfoundation/hardhat-toolbox");

const API_URL = "https://eth-sepolia.g.alchemy.com/v2/71CqPC4a1lnYFhZxzfNjGjH2BcUKRAsW"
const PRIVATE_KEY = "ad7f92c253d23bf944f160a2c50238ba85ff33c7538acc3bbdc7d26a62b9766e" 
//"746af467927e65b1f427ade6ebb0831698b1ab5d15b25408b2f07f49fe0c986c"

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "sepolia",
  allowUnlimitedContractSize: true,
  networks: {
    hardhat: {},
    sepolia: {
      url: API_URL,
      accounts: [PRIVATE_KEY]
    }
  },
}