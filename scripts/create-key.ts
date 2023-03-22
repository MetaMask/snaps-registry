import { bytesToHex } from '@metamask/utils';
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
  const privatePath = process.env.PRIVATE_KEY_PATH;
  const publicKeyPath = process.env.PUBLIC_KEY_PATH;
  assert(privatePath !== undefined, 'PRIVATE_KEY_PATH must exist.');
  assert(publicKeyPath !== undefined, 'PUBLIC_KEY_PATH must exist.');

  // write to file only if it doesn't exist
  const flag = force ? 'w' : 'wx';
  console.log('Creating key...');
  const privateKeyBytes = secp256k1.utils.randomPrivateKey();
  const publicKey = bytesToHex(secp256k1.getPublicKey(privateKeyBytes));
  console.log(`Key "${publicKey}" created.`);

  const privateKeyHex = bytesToHex(privateKeyBytes);
  console.log('Writing to files...');
  try {
    await Promise.all([
      fs.writeFile(privatePath, `${privateKeyHex}\n`, {
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
      'code' in error &&
      (error as any).code === 'EEXIST'
    ) {
      console.error(
        `File ${
          (error as any).path as string
        } already exists. Use --force to overwrite.`,
      );
      // eslint-disable-next-line node/no-process-exit
      process.exit(1);
    }
    throw error;
  }
  console.log(`Successfully wrote to files.
  -> Private key: ${path.resolve(privatePath)}
  -> Public key: ${path.resolve(publicKeyPath)}`);
}
main().catch((error) => {
  throw error;
});
