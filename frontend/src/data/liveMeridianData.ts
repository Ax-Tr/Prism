export const LIVE_ROADMAP = {
  "id": "r1",
  "visionId": "v1",
  "status": "active",
  "milestones": [
    {
      "id": "m1",
      "title": "Authentication System",
      "description": "Complete auth with SSO and role-based access",
      "departmentId": "core-arch",
      "startDate": "2026-01-20",
      "targetDate": "2026-03-15",
      "status": "completed",
      "progress": 100,
      "okrs": [
        {
          "id": "okr1",
          "title": "Implement OAuth2 + RBAC",
          "target": 100,
          "current": 100,
          "unit": "%"
        }
      ],
      "dependencies": []
    },
    {
      "id": "m2",
      "title": "Design System v2",
      "description": "Component library refresh with Prism tokens",
      "departmentId": "ux",
      "startDate": "2026-02-01",
      "targetDate": "2026-04-01",
      "status": "completed",
      "progress": 100,
      "okrs": [
        {
          "id": "okr2",
          "title": "Ship 40 UI components",
          "target": 40,
          "current": 40,
          "unit": "components"
        }
      ],
      "dependencies": [
        "m1"
      ]
    },
    {
      "id": "m3",
      "title": "API Gateway",
      "description": "Rate limiting, caching, auth proxy for all services",
      "departmentId": "core-arch",
      "startDate": "2026-03-20",
      "targetDate": "2026-05-10",
      "status": "in_progress",
      "progress": 65,
      "okrs": [
        {
          "id": "okr3",
          "title": "Achieve <100ms p95 latency",
          "target": 100,
          "current": 65,
          "unit": "%"
        }
      ],
      "dependencies": [
        "m1"
      ]
    },
    {
      "id": "m4",
      "title": "User Research Phase 2",
      "description": "Enterprise customer interviews and usability testing",
      "departmentId": "growth",
      "startDate": "2026-03-01",
      "targetDate": "2026-05-25",
      "status": "in_progress",
      "progress": 40,
      "okrs": [
        {
          "id": "okr4",
          "title": "Complete 25 enterprise interviews",
          "target": 25,
          "current": 10,
          "unit": "interviews"
        }
      ],
      "dependencies": []
    },
    {
      "id": "m5",
      "title": "Beta Launch",
      "description": "Invite-only beta with 10 companies, monitoring + feedback loop",
      "departmentId": "growth",
      "startDate": "2026-05-15",
      "targetDate": "2026-06-30",
      "status": "not_started",
      "progress": 0,
      "okrs": [
        {
          "id": "okr5",
          "title": "Onboard 10 beta companies",
          "target": 10,
          "current": 0,
          "unit": "companies"
        }
      ],
      "dependencies": [
        "m3",
        "m4"
      ]
    },
    {
      "id": "m6",
      "title": "Scale Infrastructure",
      "description": "Multi-tenant architecture, CDN, monitoring stack",
      "departmentId": "data-infra",
      "startDate": "2026-05-20",
      "targetDate": "2026-07-15",
      "status": "not_started",
      "progress": 0,
      "okrs": [
        {
          "id": "okr6",
          "title": "Support 100 concurrent orgs",
          "target": 100,
          "current": 0,
          "unit": "orgs"
        }
      ],
      "dependencies": [
        "m3"
      ]
    },
    {
      "id": "m7",
      "title": "GA Release",
      "description": "Public launch with self-serve onboarding and billing",
      "departmentId": "growth",
      "startDate": "2026-07-01",
      "targetDate": "2026-08-30",
      "status": "not_started",
      "progress": 0,
      "okrs": [
        {
          "id": "okr7",
          "title": "Achieve 50 paying customers",
          "target": 50,
          "current": 0,
          "unit": "customers"
        }
      ],
      "dependencies": [
        "m5",
        "m6"
      ]
    }
  ],
  "risks": [
    {
      "id": "rk1",
      "title": "Beta feedback may require scope change",
      "severity": "medium",
      "mitigation": "Build modular — any component can be swapped independently"
    },
    {
      "id": "rk2",
      "title": "Infrastructure costs at scale unpredictable",
      "severity": "high",
      "mitigation": "Usage-based pricing model, aggressive caching, cost alerts at thresholds"
    },
    {
      "id": "rk3",
      "title": "Key engineer burnout risk",
      "severity": "medium",
      "mitigation": "Monitor wellbeing scores, enforce PTO, hire backup for critical path"
    }
  ],
  "gaps": [
    {
      "id": "g1",
      "type": "skill",
      "title": "No dedicated DevOps engineer",
      "suggestion": "Hire or contract DevOps for Scale Infrastructure milestone"
    },
    {
      "id": "g2",
      "type": "resource",
      "title": "Marketing budget insufficient for GA",
      "suggestion": "Reallocate $50K from engineering tooling budget"
    }
  ]
};
export const LIVE_VISION = {
  "id": "v1",
  "uploadedAt": "2026-01-15T10:00:00Z",
  "rawText": "We are building an AI-powered workforce management platform that transforms how CEOs run their companies. Our goal is to make every operational decision data-driven while keeping the human element at the centre.",
  "mission": "Empower every CEO with an AI Chief Operating Officer",
  "problemStatements": [
    "CEOs spend 60% of time on operational oversight instead of strategy",
    "Employee performance data is siloed across 5+ tools",
    "Performance reviews are subjective and delayed by months"
  ],
  "revenueTargets": [
    {
      "period": "Q1 2026",
      "target": 600000
    },
    {
      "period": "Q2 2026",
      "target": 800000
    },
    {
      "period": "Q3 2026",
      "target": 900000
    },
    {
      "period": "Q4 2026",
      "target": 900000
    }
  ],
  "resources": {
    "money": 2000000,
    "headcount": 8,
    "timeMonths": 12
  },
  "targetAudience": "CEOs of 10-50 person companies",
  "techApproach": "React SPA with Anthropic Claude API for AI capabilities",
  "constraints": [
    "No external funding",
    "Remote-first team",
    "Ship MVP in 6 months"
  ]
};
