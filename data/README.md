# Seed data (local only)

Files in this folder, except this README, are gitignored so the profanity list is never committed.

- `blocklist.txt` - blocked words, separated by any whitespace (spaces or newlines). Loaded into `BlockedWord`.
- `dictionary.txt` - optional extra words for Thai word segmentation, separated by any whitespace. Loaded into `DictionaryWord`.

Run `yarn db:seed` to load them. The seed is idempotent (duplicates are skipped).
Set `SEED_SAMPLE=1` to also insert a sample invite (`SpecialKratong` with id `sample-principal`) and a few DISPLAYED kratongs for local testing.
