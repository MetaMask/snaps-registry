/**
 * npx hardhat verify --network rinkeby --constructor-args verification/args.js 0xFf250EB6300a6a39419Fa4badAC1AA959CA75ea9
 */
require('dotenv').config();
const name = process.env.NAME || "";
const symbol = process.env.SYMBOL || "";
const validator1 = process.env.VALIDATOR1 || "";
const validator2 = process.env.VALIDATOR2 || "";
const validators = [validator1, validator2];

module.exports = [
	name,
	symbol,
	validators
]
