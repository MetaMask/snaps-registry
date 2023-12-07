import type { Hex } from '@metamask/utils';
import {
  remove0x,
  stringToBytes,
  assertStruct,
  hexToBytes,
} from '@metamask/utils';
import { sha256 } from '@noble/hashes/sha256';
import {
  verify as nobleVerify,
  Signature as NobleSignature,
} from '@noble/secp256k1';
import type { Infer } from 'superstruct';
import { literal, object, pattern, string } from 'superstruct';

export const SignatureStruct = object({
  signature: pattern(string(), /0x[0-9a-f]{140}/u),
  curve: literal('secp256k1'),
  format: literal('DER'),
});

type Signature = Infer<typeof SignatureStruct>;

type VerifyArgs = {
  registry: string;
  signature: Signature;
  publicKey: Hex;
};

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

  return nobleVerify(
    NobleSignature.fromHex(remove0x(signature.signature)),
    sha256(stringToBytes(registry)),
    publicKeyBytes,
  );
}
