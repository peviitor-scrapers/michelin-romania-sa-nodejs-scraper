# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-07-31

### Fixed
- Protect stale-job deletion against data loss: when 0 jobs are scraped (Workday rate-limit or empty source), deletion is skipped entirely (#4)
- Map embedded known cities in `transformJobsForSOLR` with word-boundary detection — `EUROMASTER PITESTI` now resolves to `Pitești` instead of falling back to `România` (#4)
- Canonicalize all spelling variants of a city (ASCII/diacritic, hyphen/space) to a single canonical form in `transformJobsForSOLR`

### Changed
- Docs aligned with reality: stale-deletion behavior, `--url` CLI flag, opencode, project structure tree

## [1.0.0] - 2026-07-31

### Added
- Initial release — derived from [epam-systems-international-srl-nodejs-scraper](https://github.com/sebiboga/epam-systems-international-srl-nodejs-scraper) template
- Job scraping from Workday cxs API (`michelinhr.wd3.myworkdayjobs.com`, searchText `Romania`)
- Company validation via ANAF (MICHELIN ROMANIA S.A., CIF 13663684)
- Peviitor API integration for job + company storage
- GitHub Actions workflows for daily scraping and automated testing
- Comprehensive test suite (unit, integration, E2E, consistency)
- ANAF API fallback with cached data support
- Node 24 compatibility

### Features
- Automated daily job scraping
- Company core validation and management
- Job URL validation
- Data integrity checks
- Romanian location filtering
- Work mode normalization

## License

Copyright (c) 2024-2026 BOGA SEBASTIAN-NICOLAE
Licensed under MIT License
