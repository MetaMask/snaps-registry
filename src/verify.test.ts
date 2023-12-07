import { verify } from './verify';

const MOCK_REGISTRY = `test\n`;
const MOCK_PUBLIC_KEY =
  '0x0351e33621fd89183c3db90db7db2a518a91ad0534d1345d031625d33e581e495a';
const MOCK_SIGNATURE = {
  signature:
    '0x304402206d433e9172960de6717d94ae263e47eefacd3584a3274a452f8f9567b3a797db02201b2e423188fb3f9daa6ce6a8723f69df26bd3ceeee81f77250526b91e093614f',
  curve: 'secp256k1' as const,
  format: 'DER' as const,
};

describe('verify', () => {
  it('verifies a valid signature', async () => {
    expect(
      verify({
        registry: MOCK_REGISTRY,
        signature: MOCK_SIGNATURE,
        publicKey: MOCK_PUBLIC_KEY,
      }),
    ).toBe(true);
  });

  it('rejects an invalid signature', async () => {
    expect(
      verify({
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
    expect(() =>
      verify({
        registry: MOCK_REGISTRY,
        signature: {
          // @ts-expect-error: Invalid signature format.
          foo: 'bar',
        },
        publicKey: MOCK_PUBLIC_KEY,
      }),
    ).toThrow(
      'Invalid signature object: At path: signature -- Expected a string, but received: undefined.',
    );
  });
});
