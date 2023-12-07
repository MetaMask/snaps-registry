# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0]
### Uncategorized
- Add more metadata fields ([#316](https://github.com/MetaMask/snaps-registry/pull/316))
- Bump @metamask/snaps-controllers from 3.4.1 to 3.5.0 ([#312](https://github.com/MetaMask/snaps-registry/pull/312))
- Use `noble-hashes` and `noble-curves` ([#315](https://github.com/MetaMask/snaps-registry/pull/315))
- Bump @metamask/snaps-sdk from 1.2.0 to 1.3.0 ([#314](https://github.com/MetaMask/snaps-registry/pull/314))
- Update website for NEAR ([#311](https://github.com/MetaMask/snaps-registry/pull/311))
- Bump @metamask/snaps-utils from 4.0.1 to 5.0.0 ([#298](https://github.com/MetaMask/snaps-registry/pull/298))
- BREAKING: Bump minimum Node.js version to `^18.16.0` ([#302](https://github.com/MetaMask/snaps-registry/pull/302))
- Update Nocturne and RariMe ([#309](https://github.com/MetaMask/snaps-registry/pull/309))
- Update Polkadot and RariMe ([#306](https://github.com/MetaMask/snaps-registry/pull/306))

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

[Unreleased]: https://github.com/MetaMask/snaps-registry/compare/v3.0.0...HEAD
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
