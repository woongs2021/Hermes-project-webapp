# Dissertation References daily sync contract

**Helper:** `august-dashboard/scripts/sync-dissertation-references.py`
**Public output:** `august-dashboard/public/data/dissertation-references.json`
**Canonical candidate pool (read-only):** `/opt/data/agent-team-work-log/paper-candidates/all-research-items.jsonl`

The helper never deploys, calls the network, runs git, or executes a build. Its default is a dry run; only `--write` atomically replaces the requested output file.

## Explicit public-safe handoff boundary

A research reviewer—not the candidate collector—must create a separate JSONL file, for example:

`/opt/data/agent-team-work-log/paper-candidates/dissertation-public-approved.jsonl`

Every line must be an approved record with *all* of the following fields. There is intentionally no fallback from raw candidate metadata to approval.

```json
{
  "publicSafe": true,
  "validationStatus": "GO",
  "approvedBy": "reviewer-id",
  "approvedAt": "2026-11-18T09:00:00Z",
  "categories": ["educator", "portfolio"],
  "fitRationaleKo": "공개 가능한 검증 메모에 근거한 논문 아이디어 연결 설명.",
  "top10Rank": 1,
  "candidate": {
    "candidatePoolLine": 555,
    "sourceFingerprint": "normalized-title|normalized-authors|2026",
    "stableId": "doi:10.xxxx/example"
  }
}
```

`categories` accepts only `educator`, `learner`, and `portfolio`; a reference may belong to more than one category. `top10Rank` is optional, but present ranks must be unique and contiguous from 1. `candidatePoolLine` and the exact fingerprint bind approval to the current canonical-pool record. `stableId` is optional, but if supplied it must match the pool record. The helper rejects false/missing `publicSafe`, any non-`GO` status, missing approver/time, category errors, a pool mismatch, records without a stable ID/DOI/title+author+year identity, and a missing public source link.

Existing rows in the **already-public** base manifest are preserved as legacy public content; raw candidate-pool rows are never added unless they occur in the approved handoff.

## Determinism and counts

The output has stable sort order and deduplicates before counting by stable ID, DOI, then normalized title+author+year. It recomputes—not increments—these fields:

- `allRelevant`
- `educatorAssistant`
- `learnerAgent`
- `aiPortfolio`
- `top10`

## Cron-publisher contract (no deployment in helper)

1. The research job writes only reviewer-approved lines to the handoff file above.
2. The publisher first runs the helper **without `--write`** against a staging copy and validates/reviews the JSON diff.
3. On approval, the publisher runs the command below with `--write`, then runs its normal dashboard validation/build and commits/publishes through its own separately authorized deploy process.
4. The publisher may announce the public URL only after that external deployment and health check succeed. A non-zero helper exit means **do not publish and do not announce**.

```sh
cd /opt/data/projects/Hermes-project-webapp/august-dashboard
python3 scripts/sync-dissertation-references.py \
  --candidate-pool /opt/data/agent-team-work-log/paper-candidates/all-research-items.jsonl \
  --approved-handoff /opt/data/agent-team-work-log/paper-candidates/dissertation-public-approved.jsonl \
  --base-manifest public/data/dissertation-references.json \
  --output public/data/dissertation-references.json \
  --write
```

For a CI freshness gate, rerun the same command with `--check` and without `--write`; it exits `1` if the approved handoff would change the checked-in output.
