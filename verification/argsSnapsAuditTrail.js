/**
 * npx hardhat verify --network rinkeby --constructor-args verification/args.js 0xFf250EB6300a6a39419Fa4badAC1AA959CA75ea9
 */
require('dotenv').config();
const name = process.env.AUDIT_NAME || "";
const symbol = process.env.AUDIT_SYMBOL || "";
const snapsRegistryAddress = process.env.SNAPS_REGISTRY_ADDRESS || "";


module.exports = [
	name,
	symbol,
	snapsRegistryAddress
]
