import { assert, bytesToHex, hexToBytes, isHexString } from '@metamask/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'prettier';

dotenv.config();

/**
 * Signs the registry with the given private key.
 */
async function main() {
  const registryPath = process.env.REGISTRY_PATH;
  const signaturePath = process.env.SIGNATURE_PATH;
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;
  const privateKeyEnv = process.env.REGISTRY_PRIVATE_KEY;
  assert(
    registryPath !== undefined,
    'REGISTRY_PATH environment variable must be set.',
  );
  assert(
    signaturePath !== undefined,
    'SIGNATURE_PATH environment variable must be set.',
  );
  assert(
    privateKeyPath !== undefined || privateKeyEnv !== undefined,
    'Either PRIVATE_KEY_PATH or REGISTRY_PRIVATE_KEY environment variable must be set.',
  );

  let privateKey: string;
  if (privateKeyEnv === undefined) {
    assert(privateKeyPath !== undefined);
    console.log('Loading key from PRIVATE_KEY_PATH file...');
    privateKey = (
      await fs.readFile(privateKeyPath, { encoding: 'utf8' })
    ).trim();
  } else {
    console.log('Loading key from PRIVATE_KEY variable.');
    privateKey = privateKeyEnv;
  }

  assert(isHexString(privateKey), 'Private key must be a hex string.');
  const privateKeyBytes = hexToBytes(privateKey);
  assert(privateKeyBytes.length === 32, 'Private key must be 32 bytes');
  const publicKey = bytesToHex(secp256k1.getPublicKey(privateKeyBytes));

  const registry = await fs.readFile(registryPath);

  const signature = `0x${secp256k1
    .sign(sha256(registry), privateKeyBytes)
    .toDERHex()}`;

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
