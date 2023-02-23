/**
 * npx hardhat verify --network rinkeby --constructor-args verification/args.js 0xFf250EB6300a6a39419Fa4badAC1AA959CA75ea9
 */
require('dotenv').config();
const name = process.env.NAME || "";
const symbol = process.env.SYMBOL || "";

module.exports = [
	name,
	symbol,
]
