import {
  add0x,
  assert,
  bytesToHex,
  hexToBytes,
  isHexString,
  sha256,
} from '@metamask/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'prettier';

dotenv.config();

/**
 * Get the private key from an environment variable. Either PRIVATE_KEY_PATH or
 * REGISTRY_PRIVATE_KEY must be set.
 *
 * @returns The private key.
 * @throws If neither environment variable is set, or if the private key cannot
 * be read from the file.
 */
async function getPrivateKey() {
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;
  const privateKeyEnv = process.env.REGISTRY_PRIVATE_KEY;

  if (privateKeyEnv) {
    console.log('Using key from REGISTRY_PRIVATE_KEY variable.');
    return privateKeyEnv;
  }

  if (privateKeyPath) {
    console.log('Using key from PRIVATE_KEY_PATH file.');
    return await fs.readFile(privateKeyPath, 'utf-8').then((key) => key.trim());
  }

  throw new Error(
    'Either PRIVATE_KEY_PATH or REGISTRY_PRIVATE_KEY environment variable must be set.',
  );
}

/**
 * Signs the registry with the given private key.
 */
async function main() {
  const registryPath = process.env.REGISTRY_PATH;
  const signaturePath = process.env.SIGNATURE_PATH;

  assert(
    registryPath !== undefined,
    'REGISTRY_PATH environment variable must be set.',
  );
  assert(
    signaturePath !== undefined,
    'SIGNATURE_PATH environment variable must be set.',
  );

  const privateKey = await getPrivateKey();

  assert(isHexString(privateKey), 'Private key must be a hex string.');
  const privateKeyBytes = hexToBytes(privateKey);
  assert(privateKeyBytes.length === 32, 'Private key must be 32 bytes');
  const publicKey = bytesToHex(secp256k1.getPublicKey(privateKeyBytes));

  const registry = await fs.readFile(registryPath);

  const hash = await sha256(new Uint8Array(registry));

  const signature = add0x(secp256k1.sign(hash, privateKeyBytes).toDERHex());

  const signatureObject = format(
    JSON.stringify({
      signature,
      curve: 'secp256k1',
      format: 'DER',
    }),
    { filepath: path.resolve(process.cwd(), signaturePath) },
  );

  await fs.writeFile(signaturePath, signatureObject, 'utf-8');
  console.log(
    `Signature signed using "${publicKey}" and written to "${signaturePath}".`,
  );
}

main().catch((error) => {
  throw error;
});
