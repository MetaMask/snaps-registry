import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    local: {
      url: process.env.LOCAL_ENDPOINT,
      accounts: [`0x${process.env.LOCAL_PRIVATE_KEY}`]
    },
    ethereum: {
      url: process.env.ETHEREUM_ENDPOINT,
      accounts: [`0x${process.env.PROD_PRIVATE_KEY}`]
    },
    goerli: {
      url: process.env.GOERLI_ENDPOINT,
      accounts: [`0x${process.env.TEST_PRIVATE_KEY}`]
    },
    linea: {
      url: process.env.LINEA_ENDPOINT,
      accounts: [`0x${process.env.TEST_PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }, gasReporter: {
    enabled: true,
    coinmarketcap: process.env.COIN_MARKET_CAP_API_KEY,
  },
};

export default config;
