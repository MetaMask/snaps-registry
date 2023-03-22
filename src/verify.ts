import {
  assert,
  hexToBytes,
  isHexString,
  remove0x,
  stringToBytes,
} from '@metamask/utils';
import {
  verify as nobleVerify,
  utils,
  Signature as NobleSignature,
} from '@noble/secp256k1';
import { Infer, literal, object, pattern, string } from 'superstruct';

type Hex = string | Uint8Array;

export const SignatureStruct = object({
  signature: pattern(string(), /0x[0-9a-f]{140}/u),
  curve: literal('secp256k1'),
  format: literal('DER'),
});
type Signature = Infer<typeof SignatureStruct>;

/**
 * Verifies that the Snap Registry is properly signed using a cryptographic key.
 *
 * @param options - Parameters for signing.
 * @param options.registry - Raw text of the registry.json file.
 * @param options.signature - 0x hex encoded signature.
 * @param options.publicKey - 0x hex encoded public key to compare the signature to.
 */
export async function verify({
  registry,
  signature,
  publicKey,
}: {
  registry: string;
  signature: Signature;
  publicKey: Hex;
}): Promise<boolean> {
  assert(isHexString(publicKey) || publicKey instanceof Uint8Array);

  const publicKeyBytes =
    publicKey instanceof Uint8Array ? publicKey : hexToBytes(publicKey);

  return nobleVerify(
    NobleSignature.fromHex(remove0x(signature.signature)),
    await utils.sha256(stringToBytes(registry)),
    publicKeyBytes,
  );
}
