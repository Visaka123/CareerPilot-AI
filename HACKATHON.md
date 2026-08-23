# CareerPilot AI — Hackathon Submission Details

**Hackathon:** Into the Scrape-Verse (WeMakeDevs x Bright Data)  
**Submission Window:** Aug 17 – Aug 23, 2026  
**Project:** CareerPilot AI — Self-Healing Bright Data Job Market Intelligence Pipeline  

---

## 1. Rule 10 Disclosure: AI-Assistant & Tooling Use

In compliance with Rule 10 of the official hackathon rules, this project utilized AI coding assistance (Antigravity AI Agent with Claude / Gemini model backends) to accelerate boilerplate creation, code formatting, documentation synthesis, and test verification.

All architectural designs, domain models, Bright Data CLI workflow executions (`bdata scraper create`, `run`, `heal`, `approve`), and fallback ingestion algorithms were directed and reviewed by the author.

---

## 2. Bright Data Scraper Studio Integration Overview

### Long-Tail Target Justification
- **Target Site:** `https://www.python.org/jobs/` (Python Software Foundation Job Board)
- **Why this target:** Mainstream job boards (LinkedIn, Indeed, Glassdoor) already have pre-built scrapers in Bright Data's 800+ Scrapers Library. `python.org/jobs` is an official, niche, long-tail developer job site with **no pre-built scraper**.
- **Robots.txt & Ethics Compliance:** Fully verified. `robots.txt` disallows only `/~guido/orlijn/` and `/webstats/`. The `/jobs/` path is explicitly open for public indexing. No logins, paywalls, or PII are scraped.

### Collector ID Architecture
- **Collector ID:** `c_mt5qs76z2qeo1prcw6`
- **Creation CLI Command:**
  ```bash
  bdata scraper create https://www.python.org/jobs/ "job title, company, location, tech stack/category, posting date, listing URL"
  ```
- **Execution CLI Command:**
  ```bash
  bdata scraper run c_mt5qs76z2qeo1prcw6 https://www.python.org/jobs/
  ```

---

## 3. Self-Healing Loop & Hero Mechanic

The hero mechanic of this submission is the **Self-Healing Loop**:

```
bdata scraper create ➔ bdata scraper run ➔ (dom anomaly detected) ➔ bdata scraper heal ➔ bdata scraper approve
```

- **Discovered Anomaly:** The `company` field was duplicating the entire `job_title` string due to python.org's nested heading DOM layout.
- **Heal Run #1:** `bdata scraper heal c_mt5qs76z2qeo1prcw6 "the company field is duplicating..."` (8 steps executed).
- **Heal Run #2:** Targeted specific URL prompt pointing at `/jobs/8090/` (12 steps executed).
- **Fallback Ingestion Resolution:** Implemented `extractCleanCompany(rawCompany, rawJobTitle)` in `ScraperService.java`.
- **Zero Downstream Code Changes:** The Collector ID `c_mt5qs76z2qeo1prcw6` remained locked across all backend controllers and frontend UI pages.

Full details are documented in [`scraper/HEALING_LOG.md`](./scraper/HEALING_LOG.md).

---

## 4. Key Artifacts & Reference Files

- [`scraper/HEALING_LOG.md`](./scraper/HEALING_LOG.md) — Detailed healing log with prompts, step counts, before/after JSON snippets.
- [`database/sample-scraped-output.json`](./database/sample-scraped-output.json) — Ground-truth structured output sample.
- [`backend/src/main/java/com/careerpilot/service/ScraperService.java`](./backend/src/main/java/com/careerpilot/service/ScraperService.java) — Spring Boot service with DCA trigger API call & cleanup logic.
- [`frontend/src/pages/jobs/LiveMarketScanPage.jsx`](./frontend/src/pages/jobs/LiveMarketScanPage.jsx) — React 19 visual market scan interface & self-healing diagnostic drawer.
- [`frontend/src/pages/analytics/AnalyticsPage.jsx`](./frontend/src/pages/analytics/AnalyticsPage.jsx) — Live scraped tech stack demand visualization chart.
