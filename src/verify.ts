import type { Infer } from '@metamask/superstruct';
import { literal, object } from '@metamask/superstruct';
import type { Hex } from '@metamask/utils';
import {
  StrictHexStruct,
  remove0x,
  stringToBytes,
  assertStruct,
  hexToBytes,
} from '@metamask/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 as nobleSha256 } from '@noble/hashes/sha256';

export const SignatureStruct = object({
  signature: StrictHexStruct,
  curve: literal('secp256k1'),
  format: literal('DER'),
});

type Signature = Infer<typeof SignatureStruct>;

type VerifyArgs = {
  registry: string;
  signature: Signature;
  publicKey: Hex;
};

async function sha256(bytes: Uint8Array) {
  // Use crypto.subtle.digest whenever possible as it is faster.
  if (
    'crypto' in globalThis &&
    typeof globalThis.crypto === 'object' &&
    crypto.subtle?.digest
  ) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  }
  return nobleSha256(bytes);
}

/**
 * Verifies that the Snap Registry is properly signed using a cryptographic key.
 *
 * @param options - Parameters for signing.
 * @param options.registry - Raw text of the registry.json file.
 * @param options.signature - Hex-encoded encoded signature.
 * @param options.publicKey - Hex-encoded or Uint8Array public key to compare
 * the signature to.
 * @returns Whether the signature is valid.
 */
export async function verify({
  registry,
  signature,
  publicKey,
}: VerifyArgs): Promise<boolean> {
  assertStruct(signature, SignatureStruct, 'Invalid signature object');

  const publicKeyBytes = hexToBytes(publicKey);

  const hash = await sha256(stringToBytes(registry));

  return secp256k1.verify(
    remove0x(signature.signature),
    hash,
    publicKeyBytes,
  );
}
