import { bytesToHex, hasProperty } from '@metamask/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import assert from 'assert';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

/**
 * Create a private key to be used for signing of the registry.json.
 */
async function main() {
  const force = process.argv.includes('-f') || process.argv.includes('--force');
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;
  const publicKeyPath = process.env.PUBLIC_KEY_PATH;

  assert(privateKeyPath !== undefined, 'PRIVATE_KEY_PATH must be set.');
  assert(publicKeyPath !== undefined, 'PUBLIC_KEY_PATH must be set.');

  const privateKeyBytes = secp256k1.utils.randomPrivateKey();
  const publicKey = bytesToHex(secp256k1.getPublicKey(privateKeyBytes, true));

  console.log(`Key "${publicKey}" created.`);

  const privateKeyHex = bytesToHex(privateKeyBytes);

  try {
    // Write to file only if it doesn't exist.
    const flag = force ? 'w' : 'wx';

    await Promise.all([
      fs.writeFile(privateKeyPath, `${privateKeyHex}\n`, {
        flag,
      }),
      fs.writeFile(publicKeyPath, `${publicKey}\n`, {
        flag,
      }),
    ]);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      hasProperty(error, 'code') &&
      error.code === 'EEXIST'
    ) {
      console.error(
        `File ${
          hasProperty(error, 'path') ? String(error.path) : '(unknown path)'
        } already exists. Use --force to overwrite.`,
      );

      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    }
    throw error;
  }

  console.log(`Successfully wrote to files.
  -> Private key: ${path.resolve(privateKeyPath)}
  -> Public key: ${path.resolve(publicKeyPath)}`);
}
main().catch((error) => {
  throw error;
});
