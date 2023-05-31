# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1]
### Uncategorized
- Bump `@metamask/utils` to `6.0.0` ([#32](https://github.com/MetaMask/snaps-registry/pull/32))
- Bump @metamask/utils from 5.0.1 to 5.0.2 ([#29](https://github.com/MetaMask/snaps-registry/pull/29))
- Bump @metamask/utils from 5.0.0 to 5.0.1 ([#28](https://github.com/MetaMask/snaps-registry/pull/28))
- Refactor assertHexString function to use isStrictHexString ([#27](https://github.com/MetaMask/snaps-registry/pull/27))
- Retrigger CI and fix types in verify script ([#26](https://github.com/MetaMask/snaps-registry/pull/26))
- Fixed wrong env variable being set in CI ([#25](https://github.com/MetaMask/snaps-registry/pull/25))
- Fix private key trying to be loaded from path before env first. ([#24](https://github.com/MetaMask/snaps-registry/pull/24))
- E2E test of Github CI publishing registry ([#23](https://github.com/MetaMask/snaps-registry/pull/23))
- Hardcode deployment environment ([#22](https://github.com/MetaMask/snaps-registry/pull/22))
- Test publishing registry action ([#21](https://github.com/MetaMask/snaps-registry/pull/21))
- API-226: update action for pushing registry artifacts to remote storage ([#20](https://github.com/MetaMask/snaps-registry/pull/20))

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

[Unreleased]: https://github.com/MetaMask/snaps-registry/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/MetaMask/snaps-registry/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/MetaMask/snaps-registry/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/MetaMask/snaps-registry/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/MetaMask/snaps-registry/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MetaMask/snaps-registry/releases/tag/v1.0.0
