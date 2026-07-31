import { jest } from '@jest/globals';

describe('index.js Component Tests', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../scraper/index.js');
  });

  describe('transformJobsForSOLR', () => {
    it('should filter locations to only Romanian cities', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['România'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['Bucharest'] },
          { url: 'https://test.com/3', title: 'Job 3', location: ['Bulgaria'] },
          { url: 'https://test.com/4', title: 'Job 4', location: ['Cluj-Napoca'] },
          { url: 'https://test.com/5', title: 'Job 5', location: [] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['România']);
      expect(result.jobs[1].location).toEqual(['Bucharest']);
      expect(result.jobs[2].location).toEqual(['România']);
      expect(result.jobs[3].location).toEqual(['Cluj-Napoca']);
      expect(result.jobs[4].location).toEqual(['România']);
    });

    it('should keep company uppercase', () => {
      const payload = {
        source: 'michelinhr.wd3.myworkdayjobs.com',
        company: 'michelin romania s.a.',
        cif: '13663684',
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', company: 'michelin romania', cif: '13663684' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.company).toBe('MICHELIN ROMANIA S.A.');
    });

    it('should normalize workmode values', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', workmode: 'Remote' },
          { url: 'https://test.com/2', title: 'Job 2', workmode: 'ON-SITE' },
          { url: 'https://test.com/3', title: 'Job 3', workmode: 'Hybrid' },
          { url: 'https://test.com/4', title: 'Job 4', workmode: 'hybrid' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].workmode).toBe('remote');
      expect(result.jobs[1].workmode).toBe('on-site');
      expect(result.jobs[2].workmode).toBe('hybrid');
      expect(result.jobs[3].workmode).toBe('hybrid');
    });

    it('should handle empty jobs array', () => {
      const result = index.transformJobsForSOLR({ jobs: [] });
      expect(result.jobs).toEqual([]);
    });

    it('should map embedded known city to canonical form', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Tehnician montare', location: ['EUROMASTER PITESTI'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['MICHELIN VOLUNTARI CAMPUS'] },
          { url: 'https://test.com/3', title: 'Job 3', location: ['Cluj Napoca'] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['Pitești']);
      expect(result.jobs[1].location).toEqual(['Voluntari']);
      expect(result.jobs[2].location).toEqual(['Cluj-Napoca']);
    });

    it('should canonicalize exact lowercase city matches', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['pitesti'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['bucuresti'] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['Pitești']);
      expect(result.jobs[1].location).toEqual(['București']);
    });

    it('should not match city as substring of another word (boundary guard)', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['Devasag'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['Aradians'] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['România']);
      expect(result.jobs[1].location).toEqual(['România']);
    });
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', () => {
      const rawJob = {
        url: 'https://michelinhr.wd3.myworkdayjobs.com/Michelin/job/123',
        title: 'Senior Developer',
        location: ['Voluntari'],
        workmode: 'hybrid'
      };

      const COMPANY_NAME = 'MICHELIN ROMANIA S.A.';
      const COMPANY_CIF = '13663684';

      const result = index.mapToJobModel(rawJob, COMPANY_CIF, COMPANY_NAME);

      expect(result.url).toBe(rawJob.url);
      expect(result.title).toBe(rawJob.title);
      expect(result.company).toBe(COMPANY_NAME);
      expect(result.cif).toBe(COMPANY_CIF);
      expect(result.location).toEqual(rawJob.location);
      expect(result.workmode).toBe(rawJob.workmode);
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should remove undefined fields', () => {
      const rawJob = {
        url: 'https://test.com/1',
        title: 'Job 1'
      };

      const result = index.mapToJobModel(rawJob, '13663684');

      expect(result.location).toBeUndefined();
      expect(result.tags).toBeUndefined();
      expect(result.workmode).toBeUndefined();
    });

    it('should handle missing title', () => {
      const rawJob = { url: 'https://test.com/1' };

      const result = index.mapToJobModel(rawJob, '13663684');

      expect(result.title).toBeUndefined();
      expect(result.url).toBe('https://test.com/1');
    });
  });

  describe('parseApiJobs', () => {
    it('should parse Workday cxs API response format', () => {
      const apiData = {
        total: 100,
        jobPostings: [
          {
            title: 'Senior Developer',
            externalPath: '/job/Voluntari/Senior-Developer_R-2026000001',
            locationsText: 'Voluntari',
            remoteType: 'Hybrid'
          }
        ]
      };

      const result = index.parseApiJobs(apiData);

      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].title).toBe('Senior Developer');
      expect(result.jobs[0].url).toBe('https://michelinhr.wd3.myworkdayjobs.com/Michelin/job/Voluntari/Senior-Developer_R-2026000001');
      expect(result.jobs[0].location).toEqual(['Voluntari']);
      expect(result.jobs[0].workmode).toBe('hybrid');
    });

    it('should handle empty job list', () => {
      const apiData = { total: 0, jobPostings: [] };

      const result = index.parseApiJobs(apiData);

      expect(result.jobs).toEqual([]);
    });

    it('should handle missing data field', () => {
      const result = index.parseApiJobs({});

      expect(result.jobs).toEqual([]);
    });

    it('should split multi-location locationsText', () => {
      const apiData = {
        total: 1,
        jobPostings: [
          {
            title: 'Developer',
            externalPath: '/job/Voluntari/Developer_R-2026000001',
            locationsText: 'Voluntari, Bucuresti',
            remoteType: 'On-Site'
          }
        ]
      };

      const result = index.parseApiJobs(apiData);

      expect(result.jobs[0].location).toEqual(['Voluntari', 'Bucuresti']);
      expect(result.jobs[0].workmode).toBe('on-site');
    });

    it('should leave workmode undefined when remoteType is missing', () => {
      const apiData = {
        total: 1,
        jobPostings: [
          {
            title: 'Tehnician montare',
            externalPath: '/job/EUROMASTER-PITESTI/Tehnician-montare_R-2025000001',
            locationsText: 'EUROMASTER PITESTI'
          }
        ]
      };

      const result = index.parseApiJobs(apiData);

      expect(result.jobs[0].workmode).toBeUndefined();
      expect(result.jobs[0].location).toEqual(['EUROMASTER PITESTI']);
    });

    it('should fall back to path location for Workday "3 Locations" placeholder', () => {
      const apiData = {
        total: 1,
        jobPostings: [
          {
            title: 'Account Manager B2B OFF',
            externalPath: '/job/Voluntari/Account-Manager-B2B-OFF_R-2026000001',
            locationsText: '3 Locations',
            remoteType: 'On-Site'
          }
        ]
      };

      const result = index.parseApiJobs(apiData);

      expect(result.jobs[0].location).toEqual(['3 Locations', 'Voluntari']);
    });
  });

  describe('URL Generation', () => {
    it('should build full job URL from externalPath', () => {
      const apiData = {
        total: 1,
        jobPostings: [
          {
            title: 'Test Job',
            externalPath: '/job/Voluntari/Payroll-Analyst-with-French_R-2026025111',
            locationsText: 'Voluntari'
          }
        ]
      };

      const result = index.parseApiJobs(apiData);

      expect(result.jobs[0].url).toBe('https://michelinhr.wd3.myworkdayjobs.com/Michelin/job/Voluntari/Payroll-Analyst-with-French_R-2026025111');
    });

    it('should use full URL when externalPath is absolute', () => {
      const apiData = {
        total: 1,
        jobPostings: [
          {
            title: 'Test Job',
            externalPath: 'https://jobs.michelin.ro/en/job-offer/123',
            locationsText: 'Voluntari'
          }
        ]
      };

      const result = index.parseApiJobs(apiData);

      expect(result.jobs[0].url).toBe('https://jobs.michelin.ro/en/job-offer/123');
    });
  });
});
