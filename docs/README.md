# job_seeker_ro_spider

**job_seeker_ro_spider** — scraper pentru job-urile MICHELIN ROMANIA S.A. din România.

Extrage anunțurile din Workday ATS ([Michelin Careers](https://michelinhr.wd3.myworkdayjobs.com/Michelin)) și le publică în [peviitor.ro](https://peviitor.ro) prin API-ul Peviitor.

> **🌱 Derived scraper.** Acest repo este derivat din template-ul [epam-systems-international-srl-nodejs-scraper](https://github.com/sebiboga/epam-systems-international-srl-nodejs-scraper).

## Identificare

Toate request-urile HTTP folosesc User-Agent-ul:

```
job_seeker_ro_spider
```

## Ce face

1. **Validează compania** — interoghează API-ul public ANAF ([demoanaf.ro](https://demoanaf.ro)) după CIF-ul MICHELIN (13663684) și verifică:
   - Denumirea oficială: MICHELIN ROMANIA S.A.
   - Status: activ/inactiv/radiat
   - Adresa completă din registrul comerțului
2. **Cross-validează cu Peviitor** — verifică existența companiei în API-ul Peviitor
3. **Scrape-uiește job-urile** — extrage lista de job-uri din Workday cxs API, filtrat pe `searchText: "Romania"`
4. **Transformă datele** — normalizează locațiile (doar orașe românești), workmode-ul (remote/on-site/hybrid)
5. **Stochează în Peviitor** — upsert prin API-ul Peviitor (job-uri și date companie)
6. **Generează jobs.md** — fișier markdown cu informații companie + toate job-urile curente

## API-uri folosite

| API | URL | Autentificare |
|---|---|---|
| Workday cxs | `https://michelinhr.wd3.myworkdayjobs.com/wday/cxs/michelinhr/Michelin/jobs` | Public |
| ANAF (demoanaf) | `https://demoanaf.ro/api/...` | Public |
| Peviitor | `https://api.peviitor.ro/v1/company/` | Public |

## Robots.txt

Workday [robots.txt](https://michelinhr.wd3.myworkdayjobs.com/robots.txt) permite accesul la `/Michelin/` (site-ul de cariere) și blochează `/refreshFacet/` și `/forum*`.

Scraper-ul folosește API-ul cxs (POST JSON) cu paginare limitată și un singur User-Agent identificabil. Paginile individuale de job sunt doar verificate (HEAD request), nu parse-uite.

Pentru analiza completă, vezi [ai/ROBOTS.md](../ai/ROBOTS.md).

## Structura proiectului

```
michelin-romania-sa-nodejs-scraper/
├── .github/workflows/
│   ├── automation-testing.yml            # teste automate la push/PR + validare job-uri
│   ├── automation-template-sync-check.yml # verificare sincronizare cu template-ul EPAM
│   ├── job-deep-validate.yml             # validare deep manuală (Playwright)
│   ├── job-recovery-from-disaster.yml    # recuperare manuală (re-scrape + restore docs)
│   └── job-seeker-ro-spider.yml          # scrape zilnic (6 AM UTC)
├── ai/                                   # documentație pentru agenți AI (AGENTS.md, INSTRUCTIONS.md, etc.)
├── docs/
│   ├── README.md                         # acest fișier
│   ├── company.json                      # copie statică a config-ului companiei (GitHub Pages)
│   └── jobs.md                           # job-urile curente, generat după fiecare scrape
├── scraper/
│   ├── config/
│   │   ├── company.json                  # sursa de adevăr: identitatea companiei
│   │   └── scraper.json                  # configurări API Workday
│   ├── anaf.js                           # ANAF + CUIScan + CUIFirma
│   ├── api.js                            # operații API Peviitor (query/upsert/delete)
│   ├── company.js                        # validare companie + cache
│   ├── demoanaf.js                       # CLI wrapper pentru anaf.js
│   ├── index.js                          # entry point — workflow complet
│   ├── job-validator.js                  # primitive de validare URL
│   ├── markdown-generator.js             # generează docs/jobs.md
│   └── validate-jobs.js                  # validator manual (content-aware)
├── tests/
│   ├── unit/                             # teste unitare
│   ├── integration/                      # teste integrare (ANAF + Peviitor)
│   ├── e2e/                              # teste end-to-end
│   ├── consistency/                      # teste consistență repo/config
│   └── validate-michelin-jobs.js         # validator Michelin specific (folosit de CI)
├── tmp/                                  # artefacte runtime (gitignored)
├── CHANGELOG.md
├── LICENSE
├── package.json
└── README.md
```

## Testare

```bash
# Toate testele
npm test

# Doar unitare
npm run test:unit

# Doar integrare (necesită ANAF live, Peviitor API conditional)
npm run test:integration

# Doar E2E (API real Workday + ANAF + Peviitor)
npm run test:e2e
```

Testele Peviitor API folosesc `itIfApi` — se auto-skip dacă API-ul Peviitor nu e disponibil.
