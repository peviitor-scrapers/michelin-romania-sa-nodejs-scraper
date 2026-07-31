# Robots.txt Analysis — Michelin Workday Careers

Sursa: https://michelinhr.wd3.myworkdayjobs.com/robots.txt

## Reguli

```
User-agent: *
Disallow: /refreshFacet/
Disallow: /forum*
Allow: /BROADBEAN_external/
Allow: /Michelin/
Allow: /Talent_pool/
```

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/BROADBEAN_external/` | ✅ Allow | Conexiuni externe |
| `/Michelin/` | ✅ Allow | Site-ul de cariere Michelin (incl. paginile de job) |
| `/Talent_pool/` | ✅ Allow | Talent pool |
| `/refreshFacet/` | ❌ Disallow | Reîmprospătarea facetelor (filtre) |
| `/forum*` | ❌ Disallow | Forum |

## Recomandare

robots.txt NU este legal binding, dar reprezintă intenția proprietarului site-ului.

- API-ul cxs (`/wday/cxs/michelinhr/Michelin/jobs`, POST JSON) nu este în mod explicit permis sau blocat; răspunde cu 200 OK cu `User-Agent` normal și fără autentificare.
- Paginile individuale de job sub `/Michelin/job/...` sunt **allow** — le putem verifica (HEAD request) în teste.
- API-ul cxs este rate-limited (după mai multe cereri succesive poate răspunde cu `total: 0` și pagină goală). Scraperul face maxim câteva cereri per rulare (searchText `Romania` → de obicei o singură pagină de 20), cu delay de 1s între pagini.

**Concluzie**: Risc minim. API-ul e public, răspunde fără autentificare, iar scraperul e politicos (rate limiting, User-Agent standard, cereri limitate).

## Diferență față de EPAM template

| Aspect | EPAM template | Michelin (acest repo) |
|---|---|---|
| Sursă | `careers.epam.com/api/jobs/v2/...` (GET) | `michelinhr.wd3.myworkdayjobs.com/wday/cxs/.../jobs` (POST JSON) |
| Robots `/api/*` | ❌ Disallowed | N/A (cxs neacoperit explicit) |
| Robots pagini job | ❌ Disallowed | ✅ Allow (`/Michelin/`) |
| Rate limiting | 1s delay, 10 job-uri/pagină | 1s delay, 20 job-uri/pagină; API rate-limits după ~10+ cereri |
