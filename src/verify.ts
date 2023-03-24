import {
  assert,
  remove0x,
  stringToBytes,
  createBytes,
  isStrictHexString,
  Hex,
  assertStruct,
} from '@metamask/utils';
import {
  verify as nobleVerify,
  utils,
  Signature as NobleSignature,
} from '@noble/secp256k1';
import { Infer, literal, object, pattern, string } from 'superstruct';

export const SignatureStruct = object({
  signature: pattern(string(), /0x[0-9a-f]{140}/u),
  curve: literal('secp256k1'),
  format: literal('DER'),
});

type Signature = Infer<typeof SignatureStruct>;

type VerifyArgs = {
  registry: string;
  signature: Signature;
  publicKey: Hex | Uint8Array;
};

/**
 * Verifies that the Snap Registry is properly signed using a cryptographic key.
 *
 * @param options - Parameters for signing.
 * @param options.registry - Raw text of the registry.json file.
 * @param options.signature - Hex-encoded encoded signature.
 * @param options.publicKey - Hex-encoded or Uint8Array public key to compare
 * the signature to.
 */
export async function verify({
  registry,
  signature,
  publicKey,
}: VerifyArgs): Promise<boolean> {
  assertStruct(signature, SignatureStruct, 'Invalid signature');
  assert(isStrictHexString(publicKey) || publicKey instanceof Uint8Array);

  const publicKeyBytes = createBytes(publicKey);

  return nobleVerify(
    NobleSignature.fromHex(remove0x(signature.signature)),
    await utils.sha256(stringToBytes(registry)),
    publicKeyBytes,
  );
}
