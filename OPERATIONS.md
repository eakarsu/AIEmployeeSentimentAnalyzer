# Operations

1. Run `scripts/bootstrap.sh`, replace every placeholder in `.env`, then run `scripts/migrate.sh`.
2. Provision tenant-bound users and run `./start.sh`; individually identifying legacy routes are disabled by default and always disabled in production.
3. Demo data is opt-in: `CONFIRM_DEMO_SEED=yes scripts/seed-demo.sh` outside production only.

`/api/listening` records purpose and consent, pseudonymizes respondents, encrypts raw text, suppresses cohorts below five, exposes only aggregates, and tracks reviewed actions. Production requires employee/privacy consultation, retention operations, HR/survey connectors, bias/drift evaluation, and qualified interpretation; individual employment decisions are out of scope.
