import { assert, isHexString } from '@metamask/utils';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { assert as superstructAssert } from 'superstruct';

import { SignatureStruct, verify } from '../src';

dotenv.config();
/**
 * Verify the signature of the registry.
 */
async function main() {
  const registryPath = process.env.REGISTRY_PATH;
  const signaturePath = process.env.SIGNATURE_PATH;
  const publicKeyPath = process.env.PUBLIC_KEY_PATH;
  const publicKeyEnv = process.env.REGISTRY_PUBLIC_KEY;
  assert(
    registryPath !== undefined,
    'REGISTRY_PATH environment variable must be set.',
  );
  assert(
    signaturePath !== undefined,
    'SIGNATURE_PATH environment variable must be set.',
  );
  assert(
    publicKeyPath !== undefined || publicKeyEnv !== undefined,
    'Either PUBLIC_KEY_PATH or REGISTRY_PUBLIC_KEY environment variable must be set.',
  );

  let publicKey: string;
  if (publicKeyEnv === undefined) {
    assert(publicKeyPath !== undefined);
    console.log('Loading key from PUBLIC_KEY_PATH file...');
    publicKey = (await fs.readFile(publicKeyPath, { encoding: 'utf8' })).trim();
  } else {
    console.log('Loading key from PUBLIC_KEY variable.');
    publicKey = publicKeyEnv;
  }
  assert(isHexString(publicKey), 'PUBLIC_KEY must be a hex string.');

  const signature = JSON.parse(await fs.readFile(signaturePath, 'utf-8'));
  superstructAssert(signature, SignatureStruct);
  const registry = await fs.readFile(registryPath, 'utf-8');

  const isValid = await verify({ registry, signature, publicKey });
  if (!isValid) {
    console.error('Signature invalid');
    // eslint-disable-next-line node/no-process-exit
    process.exit(1);
  }
  console.log('Signature is valid.');
}

main().catch((error) => {
  throw error;
});
