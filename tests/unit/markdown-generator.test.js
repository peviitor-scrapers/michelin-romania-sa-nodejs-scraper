import { generateJobsMarkdown } from "../../scraper/markdown-generator.js";

const baseCompany = {
  id: "13663684",
  company: "MICHELIN ROMANIA S.A.",
  brand: "MICHELIN",
  status: "activ",
  location: ["Voluntari"],
  website: ["https://www.michelin.ro"],
  career: ["https://michelinhr.wd3.myworkdayjobs.com/Michelin"],
  lastScraped: "2026-07-31"
};

const baseJob = {
  url: "https://michelinhr.wd3.myworkdayjobs.com/Michelin/job/Voluntari/Payroll-Analyst-with-French_R-2026025111",
  title: "Payroll Analyst with French",
  workmode: "hybrid",
  location: ["Voluntari"],
  tags: ["payroll"],
  status: "scraped"
};

describe("generateJobsMarkdown", () => {
  describe("company section", () => {
    it("includes company name as h1", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("# MICHELIN ROMANIA S.A.");
    });

    it("includes CIF", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("13663684");
    });

    it("includes brand", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("MICHELIN");
    });

    it("includes status", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("activ");
    });

    it("includes website as markdown link", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("[https://www.michelin.ro](https://www.michelin.ro)");
    });

    it("includes career page as markdown link", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("[https://michelinhr.wd3.myworkdayjobs.com/Michelin](https://michelinhr.wd3.myworkdayjobs.com/Michelin)");
    });

    it("includes lastScraped date", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("2026-07-31");
    });

    it("omits optional fields when not present", () => {
      const minimal = { id: "13663684", company: "MICHELIN ROMANIA S.A." };
      const md = generateJobsMarkdown(minimal, []);
      expect(md).toContain("# MICHELIN ROMANIA S.A.");
      expect(md).not.toContain("Brand");
      expect(md).not.toContain("Last Scraped");
    });
  });

  describe("jobs section", () => {
    it("shows job count in heading", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("## Current Job Listings (1)");
    });

    it("shows 0 when no jobs", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("## Current Job Listings (0)");
    });

    it("includes job title as h3", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("### Payroll Analyst with French");
    });

    it("includes job URL as markdown link", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("[https://michelinhr.wd3.myworkdayjobs.com/Michelin/job/Voluntari/Payroll-Analyst-with-French_R-2026025111]");
    });

    it("includes workmode", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("hybrid");
    });

    it("includes location", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("Voluntari");
    });

    it("includes tags", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("payroll");
    });

    it("includes status", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("scraped");
    });

    it("renders multiple jobs", () => {
      const job2 = { ...baseJob, title: "Data Scientist", url: "https://michelinhr.wd3.myworkdayjobs.com/Michelin/job/Voluntari/Data-Scientist_R-2026029359-1" };
      const md = generateJobsMarkdown(baseCompany, [baseJob, job2]);
      expect(md).toContain("### Payroll Analyst with French");
      expect(md).toContain("### Data Scientist");
      expect(md).toContain("## Current Job Listings (2)");
    });

    it("handles job with no optional fields", () => {
      const minimal = { url: "https://michelinhr.wd3.myworkdayjobs.com/Michelin/job/Voluntari/DevOps_R-2026999999", title: "QA Engineer" };
      const md = generateJobsMarkdown(baseCompany, [minimal]);
      expect(md).toContain("### QA Engineer");
      expect(md).not.toContain("Work Mode");
      expect(md).not.toContain("Tags");
    });
  });

  describe("output format", () => {
    it("returns a non-empty string", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(typeof md).toBe("string");
      expect(md.length).toBeGreaterThan(0);
    });

    it("includes a generated timestamp", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toMatch(/_Generated: \d{4}-\d{2}-\d{2}/);
    });
  });

  describe("markdown escaping", () => {
    it("escapes # in job titles", () => {
      const job = { ...baseJob, title: "C# Developer" };
      const md = generateJobsMarkdown(baseCompany, [job]);
      expect(md).toContain("### C\\# Developer");
    });

    it("escapes * in job titles", () => {
      const job = { ...baseJob, title: "Full-Stack * Developer" };
      const md = generateJobsMarkdown(baseCompany, [job]);
      expect(md).toContain("### Full-Stack \\* Developer");
    });

    it("escapes [ ] in company name", () => {
      const company = { ...baseCompany, company: "ACME [Tech] SRL" };
      const md = generateJobsMarkdown(company, []);
      expect(md).toContain("# ACME \\[Tech\\] SRL");
    });

    it("escapes ` in tags", () => {
      const job = { ...baseJob, tags: ["node.js", "`bash`"] };
      const md = generateJobsMarkdown(baseCompany, [job]);
      expect(md).toContain("\\`bash\\`");
    });

    it("escapes # in location", () => {
      const job = { ...baseJob, location: ["Building #5"] };
      const md = generateJobsMarkdown(baseCompany, [job]);
      expect(md).toContain("Building \\#5");
    });
  });
});
