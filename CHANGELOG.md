# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0]
### Uncategorized
- Add screenshots field ([#505](https://github.com/MetaMask/snaps-registry/pull/505))
- Add category property to the Rubic Snap. ([#503](https://github.com/MetaMask/snaps-registry/pull/503))
- Update Cosmos Extension ([#501](https://github.com/MetaMask/snaps-registry/pull/501))
- Bump @metamask/utils from 8.3.0 to 8.4.0 ([#499](https://github.com/MetaMask/snaps-registry/pull/499))
- Update Cosmos Extension ([#498](https://github.com/MetaMask/snaps-registry/pull/498))
- Update CODEOWNERS ([#496](https://github.com/MetaMask/snaps-registry/pull/496))
- Bump @metamask/snaps-controllers from 6.0.2 to 6.0.3 ([#488](https://github.com/MetaMask/snaps-registry/pull/488))
- Update Partisia Blockchain ([#495](https://github.com/MetaMask/snaps-registry/pull/495))
- Update filsnap ([#493](https://github.com/MetaMask/snaps-registry/pull/493))
- Bump @metamask/snaps-utils from 7.0.2 to 7.0.3 ([#486](https://github.com/MetaMask/snaps-registry/pull/486))
- polkagate-rubic-hedera-alephzero-safeheron-defiarmor ([#485](https://github.com/MetaMask/snaps-registry/pull/485))
- Bump @metamask/safe-event-emitter from 3.0.0 to 3.1.1 ([#487](https://github.com/MetaMask/snaps-registry/pull/487))
- Bump @metamask/snaps-sdk from 3.1.0 to 3.1.1 ([#489](https://github.com/MetaMask/snaps-registry/pull/489))
- Update Starknet ([#478](https://github.com/MetaMask/snaps-registry/pull/478))
- Enabling MetaMask security code scanner ([#458](https://github.com/MetaMask/snaps-registry/pull/458))
- Add home page example Snap version 1.1.0 ([#477](https://github.com/MetaMask/snaps-registry/pull/477))
- Add home page example Snap ([#476](https://github.com/MetaMask/snaps-registry/pull/476))
- Revert "Bump `@consensys/starknet-snap` to `2.5.2` (#474)" ([#474](https://github.com/MetaMask/snaps-registry/pull/474))
- Bump `@consensys/starknet-snap` to `2.5.2` ([#474](https://github.com/MetaMask/snaps-registry/pull/474))
- Verify registry before deployment ([#473](https://github.com/MetaMask/snaps-registry/pull/473))

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

[Unreleased]: https://github.com/MetaMask/snaps-registry/compare/v3.1.0...HEAD
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
