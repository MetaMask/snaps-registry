import * as nobleHashes from '@noble/hashes/sha256';

import { verify } from './verify';

const MOCK_REGISTRY = `test\n`;
const MOCK_PUBLIC_KEY =
  '0x0351e33621fd89183c3db90db7db2a518a91ad0534d1345d031625d33e581e495a';

const MOCK_SIGNATURE = {
  signature:
    '0x304402206d433e9172960de6717d94ae263e47eefacd3584a3274a452f8f9567b3a797db02201b2e423188fb3f9daa6ce6a8723f69df26bd3ceeee81f77250526b91e093614f' as const,
  curve: 'secp256k1' as const,
  format: 'DER' as const,
};

const MOCK_LONG_REGISTRY = '2';
const MOCK_LONG_PUBLIC_KEY =
  '0x03a885324b8520fba54a173999629952cfa1f97930c20902ec389f9c32c6ffbc40';
const MOCK_LONG_SIGNATURE = {
  signature:
    '0x3045022100d601f4258b9db55994778fc7c24056f7089ff4c3976f9278ec2cea643e26dbd302205632524cb060bb82b7a966916016dca21bf8b52bb8569c87317112132ce02af0' as const,
  curve: 'secp256k1' as const,
  format: 'DER' as const,
};

const MOCK_SHORT_REGISTRY = '310';
const MOCK_SHORT_PUBLIC_KEY =
  '0x03a885324b8520fba54a173999629952cfa1f97930c20902ec389f9c32c6ffbc40';
const MOCK_SHORT_SIGNATURE = {
  signature:
    '0x30430220434042b4f8fc06534c2023286d45d6433e75a477131cb38b1e5a89dc604ea3f5021f3f2b0fcbf7c5dfc1b517a19114467c65f751f6e2b402f2b6db7f94f92f6143' as const,
  curve: 'secp256k1' as const,
  format: 'DER' as const,
};

describe('verify', () => {
  it('verifies a valid signature', async () => {
    expect(
      await verify({
        registry: MOCK_REGISTRY,
        signature: MOCK_SIGNATURE,
        publicKey: MOCK_PUBLIC_KEY,
      }),
    ).toBe(true);
  });

  it('verifies a valid signature with a longer format', async () => {
    expect(
      await verify({
        registry: MOCK_LONG_REGISTRY,
        signature: MOCK_LONG_SIGNATURE,
        publicKey: MOCK_LONG_PUBLIC_KEY,
      }),
    ).toBe(true);
  });

  it('verifies a valid signature with a shorter format', async () => {
    expect(
      await verify({
        registry: MOCK_SHORT_REGISTRY,
        signature: MOCK_SHORT_SIGNATURE,
        publicKey: MOCK_SHORT_PUBLIC_KEY,
      }),
    ).toBe(true);
  });

  it('falls back to noble when digest function is unavailable', async () => {
    const nobleSpy = jest.spyOn(nobleHashes, 'sha256');

    Object.defineProperty(globalThis.crypto.subtle, 'digest', {
      value: undefined,
      writable: true,
    });

    expect(
      await verify({
        registry: MOCK_REGISTRY,
        signature: MOCK_SIGNATURE,
        publicKey: MOCK_PUBLIC_KEY,
      }),
    ).toBe(true);

    expect(nobleSpy).toHaveBeenCalled();
  });

  it('falls back to noble when subtle APIs are unavailable', async () => {
    const nobleSpy = jest.spyOn(nobleHashes, 'sha256');

    Object.defineProperty(globalThis.crypto, 'subtle', {
      value: undefined,
      writable: true,
    });

    expect(
      await verify({
        registry: MOCK_REGISTRY,
        signature: MOCK_SIGNATURE,
        publicKey: MOCK_PUBLIC_KEY,
      }),
    ).toBe(true);

    expect(nobleSpy).toHaveBeenCalled();
  });

  it('rejects an invalid signature', async () => {
    expect(
      await verify({
        registry: MOCK_REGISTRY,
        signature: {
          ...MOCK_SIGNATURE,
          signature:
            '0x304502210098f4864a1b13199ee1c925963ea323bead8f58d649b46a2810a630ed3ea916b902207566bb6280dbc3fa48c0eecb6978101e4a23f2f4c8ead6c73ea594ec3954900d',
        },
        publicKey: MOCK_PUBLIC_KEY,
      }),
    ).toBe(false);
  });

  it('throws an error if the signature format is invalid', async () => {
    await expect(async () =>
      verify({
        registry: MOCK_REGISTRY,
        signature: {
          // @ts-expect-error: Invalid signature format.
          foo: 'bar',
        },
        publicKey: MOCK_PUBLIC_KEY,
      }),
    ).rejects.toThrow(
      'Invalid signature object: At path: signature -- Expected a string, but received: undefined.',
    );
  });
});
