# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.2.3]
### Uncategorized
- Bump `@metamask/utils` from `^10.0.0` to `^11.0.1` ([#996](https://github.com/MetaMask/snaps-registry/pull/996))
- New XRP Name ([#993](https://github.com/MetaMask/snaps-registry/pull/993))
- New Massa ([#987](https://github.com/MetaMask/snaps-registry/pull/987))
- Update Starknet ([#992](https://github.com/MetaMask/snaps-registry/pull/992))
- Update Tenderly ([#983](https://github.com/MetaMask/snaps-registry/pull/983))
- Update Self Name Resolution ([#976](https://github.com/MetaMask/snaps-registry/pull/976))
- Add screenshots for XDCWeb3Domains ([#975](https://github.com/MetaMask/snaps-registry/pull/975))
- Update Kobosu ([#971](https://github.com/MetaMask/snaps-registry/pull/971))
- Update PolkaGate ([#972](https://github.com/MetaMask/snaps-registry/pull/972))
- New EOS Wallet ([#949](https://github.com/MetaMask/snaps-registry/pull/949))
- New XDCWeb3Domains ([#959](https://github.com/MetaMask/snaps-registry/pull/959))
- New SelfNameResolution ([#958](https://github.com/MetaMask/snaps-registry/pull/958))
- Update Kobosu ([#969](https://github.com/MetaMask/snaps-registry/pull/969))
- Update Aleo Metadata ([#962](https://github.com/MetaMask/snaps-registry/pull/962))
- Unlist Polkadot ([#964](https://github.com/MetaMask/snaps-registry/pull/964))
- Update Zazen ([#960](https://github.com/MetaMask/snaps-registry/pull/960))
- Bump notification example Snap ([#966](https://github.com/MetaMask/snaps-registry/pull/966))
- Update Qtum metadata ([#956](https://github.com/MetaMask/snaps-registry/pull/956))
- Update StarkNet ([#954](https://github.com/MetaMask/snaps-registry/pull/954))
- Update Zazen description, clean line return ([#947](https://github.com/MetaMask/snaps-registry/pull/947))
- Update ZetaLink ([#943](https://github.com/MetaMask/snaps-registry/pull/943))
- Update PolkaGate ([#951](https://github.com/MetaMask/snaps-registry/pull/951))
- Update HNS.id add category ([#945](https://github.com/MetaMask/snaps-registry/pull/945))
- New Hns.id ([#941](https://github.com/MetaMask/snaps-registry/pull/941))
- New kobosu ([#908](https://github.com/MetaMask/snaps-registry/pull/908))
- Update Galactica ([#939](https://github.com/MetaMask/snaps-registry/pull/939))
- Update HashDit ([#937](https://github.com/MetaMask/snaps-registry/pull/937))
- Update Partisia Blockchain ([#934](https://github.com/MetaMask/snaps-registry/pull/934))
- New ZyfiPaymasterInsights ([#909](https://github.com/MetaMask/snaps-registry/pull/909))
- Update ZetaLink ([#917](https://github.com/MetaMask/snaps-registry/pull/917))
- Update Identify  ([#913](https://github.com/MetaMask/snaps-registry/pull/913))
- Update PolkaGate ([#930](https://github.com/MetaMask/snaps-registry/pull/930))

## [3.2.2]
### Changed
- Bump `@metamask/utils` from `^9.0.0` to `^10.0.0` ([#923](https://github.com/MetaMask/snaps-registry/pull/923))

## [3.2.1]
### Changed
- Bump `@metamask/superstruct` from `^3.0.0` to `^3.1.0` ([#693](https://github.com/MetaMask/snaps-registry/pull/693))
- Bump `@metamask/utils` from `^8.5.0` to `^9.0.0` ([#693](https://github.com/MetaMask/snaps-registry/pull/693))

## [3.2.0]
### Changed
- Bump `@metamask/utils` from `^8.3.0` to `^8.5.0` ([#613](https://github.com/MetaMask/snaps-registry/pull/613))

### Fixed
- Replace `superstruct` with ESM-compatible `@metamask/superstruct` `^3.0.0` ([#613](https://github.com/MetaMask/snaps-registry/pull/613))
  - This fixes the issue of this package being unusable by any TypeScript project that uses `Node16` or `NodeNext` as its `moduleResolution` option.

## [3.1.0]
### Added
- Add screenshots field ([#505](https://github.com/MetaMask/snaps-registry/pull/505))

### Changed
- Bump @metamask/utils from 8.3.0 to 8.4.0 ([#499](https://github.com/MetaMask/snaps-registry/pull/499))
- Bump @metamask/snaps-controllers from 6.0.2 to 6.0.3 ([#488](https://github.com/MetaMask/snaps-registry/pull/488))
- Bump @metamask/snaps-utils from 7.0.2 to 7.0.3 ([#486](https://github.com/MetaMask/snaps-registry/pull/486))
- Bump @metamask/safe-event-emitter from 3.0.0 to 3.1.1 ([#487](https://github.com/MetaMask/snaps-registry/pull/487))
- Bump @metamask/snaps-sdk from 3.1.0 to 3.1.1 ([#489](https://github.com/MetaMask/snaps-registry/pull/489))

## [3.0.1]
### Changed
- Bump `@metamask/utils` from `8.2.1` to `8.3.0` ([#374](https://github.com/MetaMask/snaps-registry/pull/374))

### Fixed
- Fix registry signature validation ([#471](https://github.com/MetaMask/snaps-registry/pull/471))

## [3.0.0]
### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#302](https://github.com/MetaMask/snaps-registry/pull/302))
- **BREAKING:** Use `noble-hashes` and `noble-curves` ([#315](https://github.com/MetaMask/snaps-registry/pull/315))
  - This is breaking as the exported `verify` function is no longer asynchronous.
  - This also improves compatibility with React Native.
- Add more metadata fields ([#316](https://github.com/MetaMask/snaps-registry/pull/316))

## [2.1.1]
### Fixed
- License package under MIT / Apache 2.0 dual license ([#272](https://github.com/MetaMask/snaps-registry/pull/272))

## [2.1.0]
### Added
- Add hidden field to metadata ([#226](https://github.com/MetaMask/snaps-registry/pull/226))

## [2.0.0]
### Changed
- **BREAKING**: Snap IDs are now required to start with the prefix `npm:` ([#75](https://github.com/MetaMask/snaps-registry/pull/75))
- Bump `@metamask/utils` to `^8.1.0` ([#72](https://github.com/MetaMask/snaps-registry/pull/72))

### Fixed
- Bump `semver` to `6.3.1` ([#70](https://github.com/MetaMask/snaps-registry/pull/70))

## [1.2.2]
### Changed
- Bump `@metamask/utils` to `7.1.0` ([#51](https://github.com/MetaMask/snaps-registry/pull/51))

## [1.2.1]
### Changed
- Bump `@metamask/utils` to `6.0.0` ([#32](https://github.com/MetaMask/snaps-registry/pull/32))

## [1.2.0]
### Added
- Sign the registry and publish signature alongside the registry ([#18](https://github.com/MetaMask/snaps-registry/pull/18))
  - This includes a function for checking the validity of the signature for a given public key

## [1.1.1]
### Changed
- Bump `@metamask/utils` to `5.0.0` ([#16](https://github.com/MetaMask/snaps-registry/pull/16))

## [1.1.0]
### Added
- Add name property to verified snaps ([#8](https://github.com/MetaMask/snaps-registry/pull/8))

## [1.0.0]
### Added
- Initial release

[Unreleased]: https://github.com/MetaMask/snaps-registry/compare/v3.2.3...HEAD
[3.2.3]: https://github.com/MetaMask/snaps-registry/compare/v3.2.2...v3.2.3
[3.2.2]: https://github.com/MetaMask/snaps-registry/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/MetaMask/snaps-registry/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/MetaMask/snaps-registry/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/MetaMask/snaps-registry/compare/v3.0.1...v3.1.0
[3.0.1]: https://github.com/MetaMask/snaps-registry/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/MetaMask/snaps-registry/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/MetaMask/snaps-registry/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/MetaMask/snaps-registry/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/MetaMask/snaps-registry/compare/v1.2.2...v2.0.0
[1.2.2]: https://github.com/MetaMask/snaps-registry/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/MetaMask/snaps-registry/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/MetaMask/snaps-registry/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/MetaMask/snaps-registry/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/MetaMask/snaps-registry/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MetaMask/snaps-registry/releases/tag/v1.0.0
