import { RolePack, RiskLevel, AutonomyLevel, ApprovalPolicy } from '@ai-employee/shared';

interface RawRoleDef {
  id: number;
  role_key: string;
  display_name: string;
  department: string;
  archetypes: string[];
  risk: RiskLevel;
  autonomyDefault: AutonomyLevel;
  autonomyMax: AutonomyLevel;
}

// 500 Canonical Role Definitions from ANEXO B
const RAW_500_ROLES: RawRoleDef[] = [
  {
    "id": 1,
    "role_key": "ceo_assistant",
    "display_name": "CEO Assistant",
    "department": "Strategy",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 2,
    "role_key": "strategy_analyst",
    "display_name": "Strategy Analyst",
    "department": "Strategy",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 3,
    "role_key": "business_planning_employee",
    "display_name": "Business Planning Employee",
    "department": "Strategy",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 4,
    "role_key": "kpi_manager",
    "display_name": "KPI Manager",
    "department": "Strategy",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 5,
    "role_key": "board_reporting_employee",
    "display_name": "Board Reporting Employee",
    "department": "Strategy",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 6,
    "role_key": "decision_support_employee",
    "display_name": "Decision Support Employee",
    "department": "Strategy",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 7,
    "role_key": "risk_strategy_employee",
    "display_name": "Risk Strategy Employee",
    "department": "Strategy",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 8,
    "role_key": "expansion_analyst",
    "display_name": "Expansion Analyst",
    "department": "Strategy",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 9,
    "role_key": "competitive_intelligence_employee",
    "display_name": "Competitive Intelligence Employee",
    "department": "Strategy",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 10,
    "role_key": "opportunity_scanner",
    "display_name": "Opportunity Scanner",
    "department": "Strategy",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 11,
    "role_key": "lead_generation",
    "display_name": "Lead Generation",
    "department": "Sales",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 12,
    "role_key": "lead_qualification",
    "display_name": "Lead Qualification",
    "department": "Sales",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 13,
    "role_key": "sales_representative",
    "display_name": "Sales Representative",
    "department": "Sales",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 14,
    "role_key": "sales_follow_up",
    "display_name": "Sales Follow-up",
    "department": "Sales",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 15,
    "role_key": "proposal",
    "display_name": "Proposal",
    "department": "Sales",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 16,
    "role_key": "quotation",
    "display_name": "Quotation",
    "department": "Sales",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 17,
    "role_key": "account_executive_assistant",
    "display_name": "Account Executive Assistant",
    "department": "Sales",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 18,
    "role_key": "pipeline_manager",
    "display_name": "Pipeline Manager",
    "department": "Sales",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 19,
    "role_key": "renewal",
    "display_name": "Renewal",
    "department": "Sales",
    "archetypes": [
      "MON"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 20,
    "role_key": "cross_sell",
    "display_name": "Cross-sell",
    "department": "Sales",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 21,
    "role_key": "upsell",
    "display_name": "Upsell",
    "department": "Sales",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 22,
    "role_key": "win_back",
    "display_name": "Win-back",
    "department": "Sales",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 23,
    "role_key": "sales_forecast",
    "display_name": "Sales Forecast",
    "department": "Sales",
    "archetypes": [
      "ANA",
      "REV",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 24,
    "role_key": "key_account",
    "display_name": "Key Account",
    "department": "Sales",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 25,
    "role_key": "marketing_planner",
    "display_name": "Marketing Planner",
    "department": "Marketing",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 26,
    "role_key": "content",
    "display_name": "Content",
    "department": "Marketing",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 27,
    "role_key": "social_media",
    "display_name": "Social Media",
    "department": "Marketing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 28,
    "role_key": "email_marketing",
    "display_name": "Email Marketing",
    "department": "Marketing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 29,
    "role_key": "campaign_manager",
    "display_name": "Campaign Manager",
    "department": "Marketing",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 30,
    "role_key": "seo",
    "display_name": "SEO",
    "department": "Marketing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 31,
    "role_key": "advertising",
    "display_name": "Advertising",
    "department": "Marketing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 32,
    "role_key": "market_research",
    "display_name": "Market Research",
    "department": "Marketing",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 33,
    "role_key": "brand_monitoring",
    "display_name": "Brand Monitoring",
    "department": "Marketing",
    "archetypes": [
      "ANA",
      "REV",
      "MON"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 34,
    "role_key": "customer_insights",
    "display_name": "Customer Insights",
    "department": "Marketing",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 35,
    "role_key": "product_marketing",
    "display_name": "Product Marketing",
    "department": "Marketing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 36,
    "role_key": "influencer_relations",
    "display_name": "Influencer Relations",
    "department": "Marketing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 37,
    "role_key": "local_marketing",
    "display_name": "Local Marketing",
    "department": "Marketing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 38,
    "role_key": "localization",
    "display_name": "Localization",
    "department": "Marketing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 39,
    "role_key": "customer_service",
    "display_name": "Customer Service",
    "department": "Customer Service",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 40,
    "role_key": "support_triage",
    "display_name": "Support Triage",
    "department": "Customer Service",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 41,
    "role_key": "complaint_resolution",
    "display_name": "Complaint Resolution",
    "department": "Customer Service",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 42,
    "role_key": "faq",
    "display_name": "FAQ",
    "department": "Customer Service",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 43,
    "role_key": "customer_onboarding",
    "display_name": "Customer Onboarding",
    "department": "Customer Service",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 44,
    "role_key": "customer_success",
    "display_name": "Customer Success",
    "department": "Customer Service",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 45,
    "role_key": "customer_retention",
    "display_name": "Customer Retention",
    "department": "Customer Service",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 46,
    "role_key": "satisfaction",
    "display_name": "Satisfaction",
    "department": "Customer Service",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 47,
    "role_key": "escalation",
    "display_name": "Escalation",
    "department": "Customer Service",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 48,
    "role_key": "service_recovery",
    "display_name": "Service Recovery",
    "department": "Customer Service",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 49,
    "role_key": "finance",
    "display_name": "Finance",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 50,
    "role_key": "accounts_payable",
    "display_name": "Accounts Payable",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R5",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 51,
    "role_key": "accounts_receivable",
    "display_name": "Accounts Receivable",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 52,
    "role_key": "collections",
    "display_name": "Collections",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 53,
    "role_key": "treasury",
    "display_name": "Treasury",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R5",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 54,
    "role_key": "cash_flow",
    "display_name": "Cash Flow",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 55,
    "role_key": "budget",
    "display_name": "Budget",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 56,
    "role_key": "expense_control",
    "display_name": "Expense Control",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 57,
    "role_key": "financial_planning",
    "display_name": "Financial Planning",
    "department": "Finance",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 58,
    "role_key": "financial_analysis",
    "display_name": "Financial Analysis",
    "department": "Finance",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 59,
    "role_key": "cost_control",
    "display_name": "Cost Control",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 60,
    "role_key": "profitability",
    "display_name": "Profitability",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 61,
    "role_key": "credit_control",
    "display_name": "Credit Control",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 62,
    "role_key": "invoice_verification",
    "display_name": "Invoice Verification",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 63,
    "role_key": "payment_preparation",
    "display_name": "Payment Preparation",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R5",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 64,
    "role_key": "bank_reconciliation",
    "display_name": "Bank Reconciliation",
    "department": "Finance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 65,
    "role_key": "accounting_assistant",
    "display_name": "Accounting Assistant",
    "department": "Accounting",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 66,
    "role_key": "document_classification",
    "display_name": "Document Classification",
    "department": "Accounting",
    "archetypes": [
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 67,
    "role_key": "journal_preparation",
    "display_name": "Journal Preparation",
    "department": "Accounting",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 68,
    "role_key": "reconciliation",
    "display_name": "Reconciliation",
    "department": "Accounting",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 69,
    "role_key": "closing",
    "display_name": "Closing",
    "department": "Accounting",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 70,
    "role_key": "fixed_assets",
    "display_name": "Fixed Assets",
    "department": "Accounting",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 71,
    "role_key": "inventory_accounting",
    "display_name": "Inventory Accounting",
    "department": "Accounting",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 72,
    "role_key": "accounting_review",
    "display_name": "Accounting Review",
    "department": "Accounting",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 73,
    "role_key": "management_reporting",
    "display_name": "Management Reporting",
    "department": "Accounting",
    "archetypes": [
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 74,
    "role_key": "consolidation",
    "display_name": "Consolidation",
    "department": "Accounting",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 75,
    "role_key": "tax_calendar",
    "display_name": "Tax Calendar",
    "department": "Tax & Compliance",
    "archetypes": [
      "MON"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 76,
    "role_key": "tax_document",
    "display_name": "Tax Document",
    "department": "Tax & Compliance",
    "archetypes": [
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 77,
    "role_key": "tax_review",
    "display_name": "Tax Review",
    "department": "Tax & Compliance",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 78,
    "role_key": "vat",
    "display_name": "VAT",
    "department": "Tax & Compliance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 79,
    "role_key": "corporate_tax",
    "display_name": "Corporate Tax",
    "department": "Tax & Compliance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 80,
    "role_key": "payroll_tax",
    "display_name": "Payroll Tax",
    "department": "Tax & Compliance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 81,
    "role_key": "regulatory_monitoring",
    "display_name": "Regulatory Monitoring",
    "department": "Tax & Compliance",
    "archetypes": [
      "ANA",
      "REV",
      "MON"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 82,
    "role_key": "compliance",
    "display_name": "Compliance",
    "department": "Tax & Compliance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 83,
    "role_key": "license_renewal",
    "display_name": "License Renewal",
    "department": "Tax & Compliance",
    "archetypes": [
      "MON"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 84,
    "role_key": "compliance_evidence",
    "display_name": "Compliance Evidence",
    "department": "Tax & Compliance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 85,
    "role_key": "filing_preparation",
    "display_name": "Filing Preparation",
    "department": "Tax & Compliance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 86,
    "role_key": "compliance_risk",
    "display_name": "Compliance Risk",
    "department": "Tax & Compliance",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 87,
    "role_key": "hr_employee",
    "display_name": "HR Employee",
    "department": "HR",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 88,
    "role_key": "recruitment",
    "display_name": "Recruitment",
    "department": "HR",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 89,
    "role_key": "cv_screening",
    "display_name": "CV Screening",
    "department": "HR",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 90,
    "role_key": "interview_scheduling",
    "display_name": "Interview Scheduling",
    "department": "HR",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 91,
    "role_key": "onboarding",
    "display_name": "Onboarding",
    "department": "HR",
    "archetypes": [
      "SUP"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 92,
    "role_key": "employee_helpdesk",
    "display_name": "Employee Helpdesk",
    "department": "HR",
    "archetypes": [
      "SUP"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 93,
    "role_key": "leave_management",
    "display_name": "Leave Management",
    "department": "HR",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 94,
    "role_key": "training",
    "display_name": "Training",
    "department": "HR",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 95,
    "role_key": "performance_review",
    "display_name": "Performance Review",
    "department": "HR",
    "archetypes": [
      "ANA",
      "REV",
      "WRI"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 96,
    "role_key": "skills_mapping",
    "display_name": "Skills Mapping",
    "department": "HR",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 97,
    "role_key": "workforce_planning",
    "display_name": "Workforce Planning",
    "department": "HR",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 98,
    "role_key": "hr_document",
    "display_name": "HR Document",
    "department": "HR",
    "archetypes": [
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 99,
    "role_key": "policy_assistant",
    "display_name": "Policy Assistant",
    "department": "HR",
    "archetypes": [
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 100,
    "role_key": "offboarding",
    "display_name": "Offboarding",
    "department": "HR",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 101,
    "role_key": "procurement",
    "display_name": "Procurement",
    "department": "Procurement",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 102,
    "role_key": "supplier_search",
    "display_name": "Supplier Search",
    "department": "Procurement",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 103,
    "role_key": "rfq",
    "display_name": "RFQ",
    "department": "Procurement",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 104,
    "role_key": "quote_comparison",
    "display_name": "Quote Comparison",
    "department": "Procurement",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L4",
    "autonomyMax": "L4"
  },
  {
    "id": 105,
    "role_key": "supplier_evaluation",
    "display_name": "Supplier Evaluation",
    "department": "Procurement",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 106,
    "role_key": "purchase_order",
    "display_name": "Purchase Order",
    "department": "Procurement",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 107,
    "role_key": "procurement_negotiation",
    "display_name": "Procurement Negotiation",
    "department": "Procurement",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 108,
    "role_key": "procurement_contract",
    "display_name": "Procurement Contract",
    "department": "Procurement",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 109,
    "role_key": "supplier_risk",
    "display_name": "Supplier Risk",
    "department": "Procurement",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 110,
    "role_key": "procurement_savings",
    "display_name": "Procurement Savings",
    "department": "Procurement",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 111,
    "role_key": "inventory",
    "display_name": "Inventory",
    "department": "Inventory",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 112,
    "role_key": "replenishment",
    "display_name": "Replenishment",
    "department": "Inventory",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 113,
    "role_key": "stockout_prevention",
    "display_name": "Stockout Prevention",
    "department": "Inventory",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 114,
    "role_key": "overstock",
    "display_name": "Overstock",
    "department": "Inventory",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 115,
    "role_key": "warehouse",
    "display_name": "Warehouse",
    "department": "Inventory",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 116,
    "role_key": "stock_reconciliation",
    "display_name": "Stock Reconciliation",
    "department": "Inventory",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 117,
    "role_key": "inventory_forecast",
    "display_name": "Inventory Forecast",
    "department": "Inventory",
    "archetypes": [
      "ANA",
      "REV",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 118,
    "role_key": "shelf_life",
    "display_name": "Shelf-life",
    "department": "Inventory",
    "archetypes": [
      "MON"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 119,
    "role_key": "slow_moving_stock",
    "display_name": "Slow-moving Stock",
    "department": "Inventory",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 120,
    "role_key": "inventory_transfer",
    "display_name": "Inventory Transfer",
    "department": "Inventory",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 121,
    "role_key": "logistics",
    "display_name": "Logistics",
    "department": "Logistics",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 122,
    "role_key": "route_planning",
    "display_name": "Route Planning",
    "department": "Logistics",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 123,
    "role_key": "dispatch",
    "display_name": "Dispatch",
    "department": "Logistics",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 124,
    "role_key": "delivery_monitoring",
    "display_name": "Delivery Monitoring",
    "department": "Logistics",
    "archetypes": [
      "ANA",
      "REV",
      "MON"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 125,
    "role_key": "fleet",
    "display_name": "Fleet",
    "department": "Logistics",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 126,
    "role_key": "fuel_control",
    "display_name": "Fuel Control",
    "department": "Logistics",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 127,
    "role_key": "vehicle_maintenance",
    "display_name": "Vehicle Maintenance",
    "department": "Logistics",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 128,
    "role_key": "driver_performance",
    "display_name": "Driver Performance",
    "department": "Logistics",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 129,
    "role_key": "logistics_cost",
    "display_name": "Logistics Cost",
    "department": "Logistics",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 130,
    "role_key": "transport_documentation",
    "display_name": "Transport Documentation",
    "department": "Logistics",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 131,
    "role_key": "operations",
    "display_name": "Operations",
    "department": "Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 132,
    "role_key": "process_monitoring",
    "display_name": "Process Monitoring",
    "department": "Operations",
    "archetypes": [
      "ANA",
      "REV",
      "MON"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 133,
    "role_key": "workflow",
    "display_name": "Workflow",
    "department": "Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 134,
    "role_key": "exception_management",
    "display_name": "Exception Management",
    "department": "Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 135,
    "role_key": "sla",
    "display_name": "SLA",
    "department": "Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 136,
    "role_key": "operations_scheduler",
    "display_name": "Operations Scheduler",
    "department": "Operations",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 137,
    "role_key": "productivity",
    "display_name": "Productivity",
    "department": "Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 138,
    "role_key": "process_improvement",
    "display_name": "Process Improvement",
    "department": "Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 139,
    "role_key": "capacity_planning",
    "display_name": "Capacity Planning",
    "department": "Operations",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 140,
    "role_key": "incident",
    "display_name": "Incident",
    "department": "Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 141,
    "role_key": "project_manager",
    "display_name": "Project Manager",
    "department": "Projects",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 142,
    "role_key": "project_planner",
    "display_name": "Project Planner",
    "department": "Projects",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 143,
    "role_key": "task_coordinator",
    "display_name": "Task Coordinator",
    "department": "Projects",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 144,
    "role_key": "milestone",
    "display_name": "Milestone",
    "department": "Projects",
    "archetypes": [
      "MON"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 145,
    "role_key": "project_risk",
    "display_name": "Project Risk",
    "department": "Projects",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 146,
    "role_key": "project_cost",
    "display_name": "Project Cost",
    "department": "Projects",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 147,
    "role_key": "project_documentation",
    "display_name": "Project Documentation",
    "department": "Projects",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 148,
    "role_key": "project_reporting",
    "display_name": "Project Reporting",
    "department": "Projects",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 149,
    "role_key": "project_quality",
    "display_name": "Project Quality",
    "department": "Projects",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 150,
    "role_key": "project_closure",
    "display_name": "Project Closure",
    "department": "Projects",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 151,
    "role_key": "legal_assistant",
    "display_name": "Legal Assistant",
    "department": "Legal",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 152,
    "role_key": "contract_review",
    "display_name": "Contract Review",
    "department": "Legal",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 153,
    "role_key": "contract_drafting",
    "display_name": "Contract Drafting",
    "department": "Legal",
    "archetypes": [
      "WRI"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 154,
    "role_key": "contract_obligation",
    "display_name": "Contract Obligation",
    "department": "Legal",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 155,
    "role_key": "contract_renewal",
    "display_name": "Contract Renewal",
    "department": "Legal",
    "archetypes": [
      "MON"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 156,
    "role_key": "legal_research",
    "display_name": "Legal Research",
    "department": "Legal",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 157,
    "role_key": "legal_document",
    "display_name": "Legal Document",
    "department": "Legal",
    "archetypes": [
      "WRI"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 158,
    "role_key": "litigation_support",
    "display_name": "Litigation Support",
    "department": "Legal",
    "archetypes": [
      "SUP"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 159,
    "role_key": "legal_risk",
    "display_name": "Legal Risk",
    "department": "Legal",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 160,
    "role_key": "corporate_governance",
    "display_name": "Corporate Governance",
    "department": "Legal",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 161,
    "role_key": "internal_audit",
    "display_name": "Internal Audit",
    "department": "Audit",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 162,
    "role_key": "transaction_testing",
    "display_name": "Transaction Testing",
    "department": "Audit",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 163,
    "role_key": "control_testing",
    "display_name": "Control Testing",
    "department": "Audit",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 164,
    "role_key": "fraud_detection",
    "display_name": "Fraud Detection",
    "department": "Audit",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 165,
    "role_key": "audit_evidence",
    "display_name": "Audit Evidence",
    "department": "Audit",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 166,
    "role_key": "audit_follow_up",
    "display_name": "Audit Follow-up",
    "department": "Audit",
    "archetypes": [
      "SUP"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 167,
    "role_key": "risk_assessment",
    "display_name": "Risk Assessment",
    "department": "Audit",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 168,
    "role_key": "segregation_of_duties",
    "display_name": "Segregation of Duties",
    "department": "Audit",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 169,
    "role_key": "audit_planning",
    "display_name": "Audit Planning",
    "department": "Audit",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 170,
    "role_key": "compliance_audit",
    "display_name": "Compliance Audit",
    "department": "Audit",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 171,
    "role_key": "it_helpdesk",
    "display_name": "IT Helpdesk",
    "department": "IT",
    "archetypes": [
      "SUP"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 172,
    "role_key": "it_ticket",
    "display_name": "IT Ticket",
    "department": "IT",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 173,
    "role_key": "systems_monitoring",
    "display_name": "Systems Monitoring",
    "department": "IT",
    "archetypes": [
      "ANA",
      "REV",
      "MON"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 174,
    "role_key": "incident_response",
    "display_name": "Incident Response",
    "department": "IT",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 175,
    "role_key": "access_review",
    "display_name": "Access Review",
    "department": "IT",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R4",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 176,
    "role_key": "software_asset",
    "display_name": "Software Asset",
    "department": "IT",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 177,
    "role_key": "it_documentation",
    "display_name": "IT Documentation",
    "department": "IT",
    "archetypes": [
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 178,
    "role_key": "devops",
    "display_name": "DevOps",
    "department": "IT",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 179,
    "role_key": "qa",
    "display_name": "QA",
    "department": "IT",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 180,
    "role_key": "bug_triage",
    "display_name": "Bug Triage",
    "department": "IT",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 181,
    "role_key": "cybersecurity",
    "display_name": "Cybersecurity",
    "department": "IT",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 182,
    "role_key": "backup_monitoring",
    "display_name": "Backup Monitoring",
    "department": "IT",
    "archetypes": [
      "ANA",
      "REV",
      "MON"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 183,
    "role_key": "product_manager",
    "display_name": "Product Manager",
    "department": "Product",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 184,
    "role_key": "product_research",
    "display_name": "Product Research",
    "department": "Product",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 185,
    "role_key": "feature_prioritization",
    "display_name": "Feature Prioritization",
    "department": "Product",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 186,
    "role_key": "product_analytics",
    "display_name": "Product Analytics",
    "department": "Product",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 187,
    "role_key": "product_feedback",
    "display_name": "Product Feedback",
    "department": "Product",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 188,
    "role_key": "product_documentation",
    "display_name": "Product Documentation",
    "department": "Product",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 189,
    "role_key": "release_planning",
    "display_name": "Release Planning",
    "department": "Product",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 190,
    "role_key": "product_qa",
    "display_name": "Product QA",
    "department": "Product",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 191,
    "role_key": "import",
    "display_name": "Import",
    "department": "International Trade",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 192,
    "role_key": "export",
    "display_name": "Export",
    "department": "International Trade",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 193,
    "role_key": "customs_documentation",
    "display_name": "Customs Documentation",
    "department": "International Trade",
    "archetypes": [
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 194,
    "role_key": "tariff_classification",
    "display_name": "Tariff Classification",
    "department": "International Trade",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 195,
    "role_key": "international_supplier",
    "display_name": "International Supplier",
    "department": "International Trade",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 196,
    "role_key": "trade_compliance",
    "display_name": "Trade Compliance",
    "department": "International Trade",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 197,
    "role_key": "freight_comparison",
    "display_name": "Freight Comparison",
    "department": "International Trade",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L4",
    "autonomyMax": "L4"
  },
  {
    "id": 198,
    "role_key": "landed_cost",
    "display_name": "Landed Cost",
    "department": "International Trade",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 199,
    "role_key": "shipping_tracking",
    "display_name": "Shipping Tracking",
    "department": "International Trade",
    "archetypes": [
      "MON"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 200,
    "role_key": "trade_risk",
    "display_name": "Trade Risk",
    "department": "International Trade",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 201,
    "role_key": "site_inspection",
    "display_name": "Site Inspection",
    "department": "Construction",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 202,
    "role_key": "construction_progress",
    "display_name": "Construction Progress",
    "department": "Construction",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 203,
    "role_key": "quantity_surveying",
    "display_name": "Quantity Surveying",
    "department": "Construction",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 204,
    "role_key": "materials_control",
    "display_name": "Materials Control",
    "department": "Construction",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 205,
    "role_key": "construction_cost",
    "display_name": "Construction Cost",
    "department": "Construction",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 206,
    "role_key": "contractor_monitoring",
    "display_name": "Contractor Monitoring",
    "department": "Construction",
    "archetypes": [
      "ANA",
      "REV",
      "MON"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 207,
    "role_key": "safety_inspection",
    "display_name": "Safety Inspection",
    "department": "Construction",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R5",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 208,
    "role_key": "project_evidence",
    "display_name": "Project Evidence",
    "department": "Construction",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 209,
    "role_key": "defects",
    "display_name": "Defects",
    "department": "Construction",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 210,
    "role_key": "maintenance_planning",
    "display_name": "Maintenance Planning",
    "department": "Construction",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 211,
    "role_key": "appointment",
    "display_name": "Appointment",
    "department": "Healthcare Admin",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 212,
    "role_key": "patient_administration",
    "display_name": "Patient Administration",
    "department": "Healthcare Admin",
    "archetypes": [
      "SUP"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 213,
    "role_key": "billing",
    "display_name": "Billing",
    "department": "Healthcare Admin",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 214,
    "role_key": "insurance_verification",
    "display_name": "Insurance Verification",
    "department": "Healthcare Admin",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 215,
    "role_key": "medical_documentation_assistant",
    "display_name": "Medical Documentation Assistant",
    "department": "Healthcare Admin",
    "archetypes": [
      "WRI"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 216,
    "role_key": "clinic_inventory",
    "display_name": "Clinic Inventory",
    "department": "Healthcare Admin",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 217,
    "role_key": "patient_follow_up",
    "display_name": "Patient Follow-up",
    "department": "Healthcare Admin",
    "archetypes": [
      "SUP"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 218,
    "role_key": "healthcare_compliance",
    "display_name": "Healthcare Compliance",
    "department": "Healthcare Admin",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 219,
    "role_key": "student_support",
    "display_name": "Student Support",
    "department": "Education",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 220,
    "role_key": "tutor",
    "display_name": "Tutor",
    "department": "Education",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 221,
    "role_key": "course_administration",
    "display_name": "Course Administration",
    "department": "Education",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 222,
    "role_key": "enrollment",
    "display_name": "Enrollment",
    "department": "Education",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 223,
    "role_key": "assessment_assistant",
    "display_name": "Assessment Assistant",
    "department": "Education",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 224,
    "role_key": "training_planner",
    "display_name": "Training Planner",
    "department": "Education",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 225,
    "role_key": "certification",
    "display_name": "Certification",
    "department": "Education",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 226,
    "role_key": "learning_analytics",
    "display_name": "Learning Analytics",
    "department": "Education",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 227,
    "role_key": "real_estate_sales",
    "display_name": "Real Estate Sales",
    "department": "Real Estate",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 228,
    "role_key": "property_listing",
    "display_name": "Property Listing",
    "department": "Real Estate",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 229,
    "role_key": "tenant_support",
    "display_name": "Tenant Support",
    "department": "Real Estate",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 230,
    "role_key": "rent_collections",
    "display_name": "Rent Collections",
    "department": "Real Estate",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 231,
    "role_key": "lease_administration",
    "display_name": "Lease Administration",
    "department": "Real Estate",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 232,
    "role_key": "property_maintenance",
    "display_name": "Property Maintenance",
    "department": "Real Estate",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 233,
    "role_key": "property_inspection",
    "display_name": "Property Inspection",
    "department": "Real Estate",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 234,
    "role_key": "property_portfolio",
    "display_name": "Property Portfolio",
    "department": "Real Estate",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 235,
    "role_key": "reservation",
    "display_name": "Reservation",
    "department": "Hospitality",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 236,
    "role_key": "guest_support",
    "display_name": "Guest Support",
    "department": "Hospitality",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 237,
    "role_key": "revenue_management",
    "display_name": "Revenue Management",
    "department": "Hospitality",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 238,
    "role_key": "housekeeping_coordinator",
    "display_name": "Housekeeping Coordinator",
    "department": "Hospitality",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 239,
    "role_key": "hotel_procurement",
    "display_name": "Hotel Procurement",
    "department": "Hospitality",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 240,
    "role_key": "guest_feedback",
    "display_name": "Guest Feedback",
    "department": "Hospitality",
    "archetypes": [
      "SUP"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 241,
    "role_key": "travel_planning",
    "display_name": "Travel Planning",
    "department": "Hospitality",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 242,
    "role_key": "event_booking",
    "display_name": "Event Booking",
    "department": "Hospitality",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 243,
    "role_key": "store_employee",
    "display_name": "Store Employee",
    "department": "Retail",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 244,
    "role_key": "merchandising",
    "display_name": "Merchandising",
    "department": "Retail",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 245,
    "role_key": "price_monitoring",
    "display_name": "Price Monitoring",
    "department": "Retail",
    "archetypes": [
      "ANA",
      "REV",
      "MON"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 246,
    "role_key": "promotion",
    "display_name": "Promotion",
    "department": "Retail",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 247,
    "role_key": "customer_loyalty",
    "display_name": "Customer Loyalty",
    "department": "Retail",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 248,
    "role_key": "retail_inventory",
    "display_name": "Retail Inventory",
    "department": "Retail",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 249,
    "role_key": "supplier_reorder",
    "display_name": "Supplier Reorder",
    "department": "Retail",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 250,
    "role_key": "store_performance",
    "display_name": "Store Performance",
    "department": "Retail",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 251,
    "role_key": "ai_workforce_manager",
    "display_name": "AI Workforce Manager",
    "department": "Workforce Management",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 252,
    "role_key": "ai_employee_supervisor",
    "display_name": "AI Employee Supervisor",
    "department": "Workforce Management",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 253,
    "role_key": "ai_task_router",
    "display_name": "AI Task Router",
    "department": "Workforce Management",
    "archetypes": [
      "MAN",
      "COA",
      "PLN"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 254,
    "role_key": "ai_exception_manager",
    "display_name": "AI Exception Manager",
    "department": "Workforce Management",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 255,
    "role_key": "ai_quality_manager",
    "display_name": "AI Quality Manager",
    "department": "Workforce Management",
    "archetypes": [
      "MAN",
      "COA",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 256,
    "role_key": "ai_policy_manager",
    "display_name": "AI Policy Manager",
    "department": "Workforce Management",
    "archetypes": [
      "MAN",
      "COA",
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L2",
    "autonomyMax": "L2"
  },
  {
    "id": 257,
    "role_key": "ai_workforce_auditor",
    "display_name": "AI Workforce Auditor",
    "department": "Workforce Management",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 258,
    "role_key": "ai_performance_manager",
    "display_name": "AI Performance Manager",
    "department": "Workforce Management",
    "archetypes": [
      "MAN",
      "COA",
      "WRI"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 259,
    "role_key": "ai_cost_optimizer",
    "display_name": "AI Cost Optimizer",
    "department": "Workforce Management",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 260,
    "role_key": "ai_workforce_trainer",
    "display_name": "AI Workforce Trainer",
    "department": "Workforce Management",
    "archetypes": [
      "MAN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 261,
    "role_key": "document_creator",
    "display_name": "Document Creator",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 262,
    "role_key": "business_writer",
    "display_name": "Business Writer",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 263,
    "role_key": "letter_employee",
    "display_name": "Letter Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 264,
    "role_key": "proposal_employee",
    "display_name": "Proposal Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 265,
    "role_key": "report_employee",
    "display_name": "Report Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 266,
    "role_key": "contract_creator",
    "display_name": "Contract Creator",
    "department": "Documents",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 267,
    "role_key": "legal_document_employee",
    "display_name": "Legal Document Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 268,
    "role_key": "tax_document_employee",
    "display_name": "Tax Document Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 269,
    "role_key": "hr_document_employee",
    "display_name": "HR Document Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 270,
    "role_key": "banking_document_employee",
    "display_name": "Banking Document Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 271,
    "role_key": "government_document_employee",
    "display_name": "Government Document Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 272,
    "role_key": "tender_procurement_document_employee",
    "display_name": "Tender & Procurement Document Employee",
    "department": "Documents",
    "archetypes": [
      "WRI",
      "EXE"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 273,
    "role_key": "policy_writer",
    "display_name": "Policy Writer",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 274,
    "role_key": "sop_employee",
    "display_name": "SOP Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 275,
    "role_key": "manual_creator",
    "display_name": "Manual Creator",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 276,
    "role_key": "form_creator",
    "display_name": "Form Creator",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 277,
    "role_key": "template_builder",
    "display_name": "Template Builder",
    "department": "Documents",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 278,
    "role_key": "document_designer",
    "display_name": "Document Designer",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 279,
    "role_key": "document_formatter",
    "display_name": "Document Formatter",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 280,
    "role_key": "proofreader",
    "display_name": "Proofreader",
    "department": "Documents",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L4",
    "autonomyMax": "L4"
  },
  {
    "id": 281,
    "role_key": "document_reviewer",
    "display_name": "Document Reviewer",
    "department": "Documents",
    "archetypes": [
      "ANA",
      "REV",
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L4",
    "autonomyMax": "L4"
  },
  {
    "id": 282,
    "role_key": "document_comparison_employee",
    "display_name": "Document Comparison Employee",
    "department": "Documents",
    "archetypes": [
      "ANA",
      "REV",
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L4",
    "autonomyMax": "L4"
  },
  {
    "id": 283,
    "role_key": "pdf_employee",
    "display_name": "PDF Employee",
    "department": "Documents",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 284,
    "role_key": "word_employee",
    "display_name": "Word Employee",
    "department": "Documents",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 285,
    "role_key": "presentation_employee",
    "display_name": "Presentation Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 286,
    "role_key": "spreadsheet_employee",
    "display_name": "Spreadsheet Employee",
    "department": "Documents",
    "archetypes": [
      "WRI"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 287,
    "role_key": "loan_origination_employee",
    "display_name": "Loan Origination Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 288,
    "role_key": "credit_analysis_employee",
    "display_name": "Credit Analysis Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 289,
    "role_key": "kyc_verification_employee",
    "display_name": "KYC Verification Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 290,
    "role_key": "aml_monitoring_employee",
    "display_name": "AML Monitoring Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 291,
    "role_key": "transaction_monitoring_employee",
    "display_name": "Transaction Monitoring Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 292,
    "role_key": "branch_operations_employee",
    "display_name": "Branch Operations Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 293,
    "role_key": "banking_customer_onboarding_employee",
    "display_name": "Banking Customer Onboarding Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 294,
    "role_key": "loan_servicing_employee",
    "display_name": "Loan Servicing Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 295,
    "role_key": "collateral_monitoring_employee",
    "display_name": "Collateral Monitoring Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 296,
    "role_key": "credit_portfolio_employee",
    "display_name": "Credit Portfolio Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 297,
    "role_key": "collections_banking_employee",
    "display_name": "Collections Banking Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 298,
    "role_key": "banking_fraud_review_employee",
    "display_name": "Banking Fraud Review Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 299,
    "role_key": "regulatory_banking_reporting_employee",
    "display_name": "Regulatory Banking Reporting Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 300,
    "role_key": "account_opening_employee",
    "display_name": "Account Opening Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 301,
    "role_key": "card_operations_employee",
    "display_name": "Card Operations Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 302,
    "role_key": "banking_dispute_resolution_employee",
    "display_name": "Banking Dispute Resolution Employee",
    "department": "Banking & Financial Services",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 303,
    "role_key": "claims_intake_employee",
    "display_name": "Claims Intake Employee",
    "department": "Insurance",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 304,
    "role_key": "claims_review_employee",
    "display_name": "Claims Review Employee",
    "department": "Insurance",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 305,
    "role_key": "policy_administration_employee",
    "display_name": "Policy Administration Employee",
    "department": "Insurance",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 306,
    "role_key": "underwriting_assistant_employee",
    "display_name": "Underwriting Assistant Employee",
    "department": "Insurance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 307,
    "role_key": "insurance_renewal_employee",
    "display_name": "Insurance Renewal Employee",
    "department": "Insurance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 308,
    "role_key": "claims_fraud_monitoring_employee",
    "display_name": "Claims Fraud Monitoring Employee",
    "department": "Insurance",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 309,
    "role_key": "broker_support_employee",
    "display_name": "Broker Support Employee",
    "department": "Insurance",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 310,
    "role_key": "premium_collections_employee",
    "display_name": "Premium Collections Employee",
    "department": "Insurance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 311,
    "role_key": "insurance_documentation_employee",
    "display_name": "Insurance Documentation Employee",
    "department": "Insurance",
    "archetypes": [
      "WRI",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 312,
    "role_key": "claims_settlement_preparation_employee",
    "display_name": "Claims Settlement Preparation Employee",
    "department": "Insurance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 313,
    "role_key": "policy_cancellation_employee",
    "display_name": "Policy Cancellation Employee",
    "department": "Insurance",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 314,
    "role_key": "reinsurance_administration_employee",
    "display_name": "Reinsurance Administration Employee",
    "department": "Insurance",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 315,
    "role_key": "insurance_compliance_employee",
    "display_name": "Insurance Compliance Employee",
    "department": "Insurance",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 316,
    "role_key": "customer_policy_service_employee",
    "display_name": "Customer Policy Service Employee",
    "department": "Insurance",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 317,
    "role_key": "farm_planning_employee",
    "display_name": "Farm Planning Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 318,
    "role_key": "crop_monitoring_employee",
    "display_name": "Crop Monitoring Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 319,
    "role_key": "agricultural_input_planning_employee",
    "display_name": "Agricultural Input Planning Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 320,
    "role_key": "irrigation_monitoring_employee",
    "display_name": "Irrigation Monitoring Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 321,
    "role_key": "yield_forecast_employee",
    "display_name": "Yield Forecast Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "FOR",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 322,
    "role_key": "farm_cost_control_employee",
    "display_name": "Farm Cost Control Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 323,
    "role_key": "livestock_administration_employee",
    "display_name": "Livestock Administration Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 324,
    "role_key": "feed_planning_employee",
    "display_name": "Feed Planning Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 325,
    "role_key": "harvest_planning_employee",
    "display_name": "Harvest Planning Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 326,
    "role_key": "agricultural_procurement_employee",
    "display_name": "Agricultural Procurement Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 327,
    "role_key": "farm_inventory_employee",
    "display_name": "Farm Inventory Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 328,
    "role_key": "produce_traceability_employee",
    "display_name": "Produce Traceability Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 329,
    "role_key": "post_harvest_operations_employee",
    "display_name": "Post-Harvest Operations Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 330,
    "role_key": "agricultural_market_intelligence_employee",
    "display_name": "Agricultural Market Intelligence Employee",
    "department": "Agriculture & Agribusiness",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 331,
    "role_key": "production_planning_employee",
    "display_name": "Production Planning Employee",
    "department": "Manufacturing",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 332,
    "role_key": "production_scheduling_employee",
    "display_name": "Production Scheduling Employee",
    "department": "Manufacturing",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 333,
    "role_key": "manufacturing_quality_control_employee",
    "display_name": "Manufacturing Quality Control Employee",
    "department": "Manufacturing",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 334,
    "role_key": "oee_monitoring_employee",
    "display_name": "OEE Monitoring Employee",
    "department": "Manufacturing",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 335,
    "role_key": "downtime_analysis_employee",
    "display_name": "Downtime Analysis Employee",
    "department": "Manufacturing",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 336,
    "role_key": "preventive_maintenance_planning_employee",
    "display_name": "Preventive Maintenance Planning Employee",
    "department": "Manufacturing",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 337,
    "role_key": "work_order_coordinator_employee",
    "display_name": "Work Order Coordinator Employee",
    "department": "Manufacturing",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 338,
    "role_key": "bill_of_materials_employee",
    "display_name": "Bill of Materials Employee",
    "department": "Manufacturing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 339,
    "role_key": "materials_requirement_planning_employee",
    "display_name": "Materials Requirement Planning Employee",
    "department": "Manufacturing",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 340,
    "role_key": "production_costing_employee",
    "display_name": "Production Costing Employee",
    "department": "Manufacturing",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 341,
    "role_key": "scrap_and_waste_monitoring_employee",
    "display_name": "Scrap & Waste Monitoring Employee",
    "department": "Manufacturing",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 342,
    "role_key": "shop_floor_reporting_employee",
    "display_name": "Shop Floor Reporting Employee",
    "department": "Manufacturing",
    "archetypes": [
      "WRI",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 343,
    "role_key": "capacity_balancing_employee",
    "display_name": "Capacity Balancing Employee",
    "department": "Manufacturing",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 344,
    "role_key": "manufacturing_traceability_employee",
    "display_name": "Manufacturing Traceability Employee",
    "department": "Manufacturing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 345,
    "role_key": "production_changeover_employee",
    "display_name": "Production Changeover Employee",
    "department": "Manufacturing",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 346,
    "role_key": "plant_performance_employee",
    "display_name": "Plant Performance Employee",
    "department": "Manufacturing",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 347,
    "role_key": "energy_operations_employee",
    "display_name": "Energy Operations Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 348,
    "role_key": "utility_metering_employee",
    "display_name": "Utility Metering Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 349,
    "role_key": "energy_consumption_analysis_employee",
    "display_name": "Energy Consumption Analysis Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 350,
    "role_key": "grid_incident_employee",
    "display_name": "Grid Incident Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 351,
    "role_key": "outage_management_employee",
    "display_name": "Outage Management Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 352,
    "role_key": "preventive_grid_maintenance_employee",
    "display_name": "Preventive Grid Maintenance Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 353,
    "role_key": "utility_billing_review_employee",
    "display_name": "Utility Billing Review Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 354,
    "role_key": "energy_loss_monitoring_employee",
    "display_name": "Energy Loss Monitoring Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 355,
    "role_key": "renewable_generation_monitoring_employee",
    "display_name": "Renewable Generation Monitoring Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 356,
    "role_key": "power_purchase_administration_employee",
    "display_name": "Power Purchase Administration Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 357,
    "role_key": "water_network_monitoring_employee",
    "display_name": "Water Network Monitoring Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 358,
    "role_key": "water_loss_analysis_employee",
    "display_name": "Water Loss Analysis Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 359,
    "role_key": "utility_field_service_employee",
    "display_name": "Utility Field Service Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 360,
    "role_key": "energy_demand_forecast_employee",
    "display_name": "Energy Demand Forecast Employee",
    "department": "Energy & Utilities",
    "archetypes": [
      "FOR",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 361,
    "role_key": "network_operations_employee",
    "display_name": "Network Operations Employee",
    "department": "Telecommunications",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 362,
    "role_key": "telecom_incident_employee",
    "display_name": "Telecom Incident Employee",
    "department": "Telecommunications",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 363,
    "role_key": "tower_operations_employee",
    "display_name": "Tower Operations Employee",
    "department": "Telecommunications",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 364,
    "role_key": "telecom_field_service_employee",
    "display_name": "Telecom Field Service Employee",
    "department": "Telecommunications",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 365,
    "role_key": "subscriber_onboarding_employee",
    "display_name": "Subscriber Onboarding Employee",
    "department": "Telecommunications",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 366,
    "role_key": "subscriber_retention_employee",
    "display_name": "Subscriber Retention Employee",
    "department": "Telecommunications",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 367,
    "role_key": "telecom_revenue_assurance_employee",
    "display_name": "Telecom Revenue Assurance Employee",
    "department": "Telecommunications",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 368,
    "role_key": "sim_lifecycle_employee",
    "display_name": "SIM Lifecycle Employee",
    "department": "Telecommunications",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 369,
    "role_key": "network_capacity_planning_employee",
    "display_name": "Network Capacity Planning Employee",
    "department": "Telecommunications",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 370,
    "role_key": "service_activation_employee",
    "display_name": "Service Activation Employee",
    "department": "Telecommunications",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 371,
    "role_key": "telecom_billing_review_employee",
    "display_name": "Telecom Billing Review Employee",
    "department": "Telecommunications",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 372,
    "role_key": "churn_prediction_employee",
    "display_name": "Churn Prediction Employee",
    "department": "Telecommunications",
    "archetypes": [
      "FOR",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 373,
    "role_key": "telecom_fraud_monitoring_employee",
    "display_name": "Telecom Fraud Monitoring Employee",
    "department": "Telecommunications",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 374,
    "role_key": "tower_maintenance_planning_employee",
    "display_name": "Tower Maintenance Planning Employee",
    "department": "Telecommunications",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 375,
    "role_key": "mine_planning_assistant_employee",
    "display_name": "Mine Planning Assistant Employee",
    "department": "Mining",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 376,
    "role_key": "mining_production_monitoring_employee",
    "display_name": "Mining Production Monitoring Employee",
    "department": "Mining",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 377,
    "role_key": "ore_grade_tracking_employee",
    "display_name": "Ore Grade Tracking Employee",
    "department": "Mining",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 378,
    "role_key": "mining_equipment_utilization_employee",
    "display_name": "Mining Equipment Utilization Employee",
    "department": "Mining",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 379,
    "role_key": "mine_maintenance_planning_employee",
    "display_name": "Mine Maintenance Planning Employee",
    "department": "Mining",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 380,
    "role_key": "mining_safety_administration_employee",
    "display_name": "Mining Safety Administration Employee",
    "department": "Mining",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 381,
    "role_key": "mining_environmental_monitoring_employee",
    "display_name": "Mining Environmental Monitoring Employee",
    "department": "Mining",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 382,
    "role_key": "mine_contractor_coordination_employee",
    "display_name": "Mine Contractor Coordination Employee",
    "department": "Mining",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 383,
    "role_key": "mining_inventory_employee",
    "display_name": "Mining Inventory Employee",
    "department": "Mining",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 384,
    "role_key": "mine_dispatch_employee",
    "display_name": "Mine Dispatch Employee",
    "department": "Mining",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 385,
    "role_key": "mining_cost_control_employee",
    "display_name": "Mining Cost Control Employee",
    "department": "Mining",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 386,
    "role_key": "mine_rehabilitation_planning_employee",
    "display_name": "Mine Rehabilitation Planning Employee",
    "department": "Mining",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 387,
    "role_key": "field_operations_employee",
    "display_name": "Field Operations Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 388,
    "role_key": "well_operations_monitoring_employee",
    "display_name": "Well Operations Monitoring Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 389,
    "role_key": "production_allocation_employee",
    "display_name": "Production Allocation Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 390,
    "role_key": "oilfield_maintenance_planning_employee",
    "display_name": "Oilfield Maintenance Planning Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 391,
    "role_key": "pipeline_monitoring_employee",
    "display_name": "Pipeline Monitoring Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 392,
    "role_key": "hydrocarbon_loss_monitoring_employee",
    "display_name": "Hydrocarbon Loss Monitoring Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 393,
    "role_key": "fuel_terminal_operations_employee",
    "display_name": "Fuel Terminal Operations Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 394,
    "role_key": "tank_inventory_employee",
    "display_name": "Tank Inventory Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 395,
    "role_key": "oil_and_gas_contractor_monitoring_employee",
    "display_name": "Oil & Gas Contractor Monitoring Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 396,
    "role_key": "hse_administration_employee",
    "display_name": "HSE Administration Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 397,
    "role_key": "petroleum_logistics_employee",
    "display_name": "Petroleum Logistics Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 398,
    "role_key": "oil_and_gas_compliance_employee",
    "display_name": "Oil & Gas Compliance Employee",
    "department": "Oil & Gas",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 399,
    "role_key": "citizen_request_employee",
    "display_name": "Citizen Request Employee",
    "department": "Public Administration",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 400,
    "role_key": "permit_processing_employee",
    "display_name": "Permit Processing Employee",
    "department": "Public Administration",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 401,
    "role_key": "municipal_licensing_employee",
    "display_name": "Municipal Licensing Employee",
    "department": "Public Administration",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 402,
    "role_key": "municipal_inspection_employee",
    "display_name": "Municipal Inspection Employee",
    "department": "Public Administration",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 403,
    "role_key": "public_works_monitoring_employee",
    "display_name": "Public Works Monitoring Employee",
    "department": "Public Administration",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 404,
    "role_key": "public_procurement_administration_employee",
    "display_name": "Public Procurement Administration Employee",
    "department": "Public Administration",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 405,
    "role_key": "government_correspondence_employee",
    "display_name": "Government Correspondence Employee",
    "department": "Public Administration",
    "archetypes": [
      "WRI",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 406,
    "role_key": "public_service_appointment_employee",
    "display_name": "Public Service Appointment Employee",
    "department": "Public Administration",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 407,
    "role_key": "municipal_revenue_follow_up_employee",
    "display_name": "Municipal Revenue Follow-up Employee",
    "department": "Public Administration",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 408,
    "role_key": "urban_service_complaint_employee",
    "display_name": "Urban Service Complaint Employee",
    "department": "Public Administration",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 409,
    "role_key": "public_asset_register_employee",
    "display_name": "Public Asset Register Employee",
    "department": "Public Administration",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 410,
    "role_key": "government_grant_administration_employee",
    "display_name": "Government Grant Administration Employee",
    "department": "Public Administration",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 411,
    "role_key": "public_program_monitoring_employee",
    "display_name": "Public Program Monitoring Employee",
    "department": "Public Administration",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 412,
    "role_key": "regulatory_permit_renewal_employee",
    "display_name": "Regulatory Permit Renewal Employee",
    "department": "Public Administration",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 413,
    "role_key": "public_records_employee",
    "display_name": "Public Records Employee",
    "department": "Public Administration",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 414,
    "role_key": "administrative_process_tracking_employee",
    "display_name": "Administrative Process Tracking Employee",
    "department": "Public Administration",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 415,
    "role_key": "facility_operations_employee",
    "display_name": "Facility Operations Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 416,
    "role_key": "preventive_facility_maintenance_employee",
    "display_name": "Preventive Facility Maintenance Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 417,
    "role_key": "corrective_maintenance_coordinator_employee",
    "display_name": "Corrective Maintenance Coordinator Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 418,
    "role_key": "cleaning_operations_employee",
    "display_name": "Cleaning Operations Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 419,
    "role_key": "building_energy_monitoring_employee",
    "display_name": "Building Energy Monitoring Employee",
    "department": "Facilities Management",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 420,
    "role_key": "facility_asset_inspection_employee",
    "display_name": "Facility Asset Inspection Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 421,
    "role_key": "space_management_employee",
    "display_name": "Space Management Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 422,
    "role_key": "workplace_service_employee",
    "display_name": "Workplace Service Employee",
    "department": "Facilities Management",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 423,
    "role_key": "facility_vendor_coordinator_employee",
    "display_name": "Facility Vendor Coordinator Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 424,
    "role_key": "building_access_administration_employee",
    "display_name": "Building Access Administration Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 425,
    "role_key": "facility_compliance_employee",
    "display_name": "Facility Compliance Employee",
    "department": "Facilities Management",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 426,
    "role_key": "maintenance_sla_employee",
    "display_name": "Maintenance SLA Employee",
    "department": "Facilities Management",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 427,
    "role_key": "security_operations_employee",
    "display_name": "Security Operations Employee",
    "department": "Security & Safety",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 428,
    "role_key": "access_control_review_employee",
    "display_name": "Access Control Review Employee",
    "department": "Security & Safety",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 429,
    "role_key": "physical_security_incident_employee",
    "display_name": "Physical Security Incident Employee",
    "department": "Security & Safety",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 430,
    "role_key": "visitor_management_employee",
    "display_name": "Visitor Management Employee",
    "department": "Security & Safety",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 431,
    "role_key": "security_patrol_coordinator_employee",
    "display_name": "Security Patrol Coordinator Employee",
    "department": "Security & Safety",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 432,
    "role_key": "cctv_incident_triage_employee",
    "display_name": "CCTV Incident Triage Employee",
    "department": "Security & Safety",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 433,
    "role_key": "emergency_preparedness_employee",
    "display_name": "Emergency Preparedness Employee",
    "department": "Security & Safety",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 434,
    "role_key": "safety_training_coordinator_employee",
    "display_name": "Safety Training Coordinator Employee",
    "department": "Security & Safety",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 435,
    "role_key": "workplace_safety_observation_employee",
    "display_name": "Workplace Safety Observation Employee",
    "department": "Security & Safety",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 436,
    "role_key": "security_contractor_monitoring_employee",
    "display_name": "Security Contractor Monitoring Employee",
    "department": "Security & Safety",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 437,
    "role_key": "incident_evidence_employee",
    "display_name": "Incident Evidence Employee",
    "department": "Security & Safety",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 438,
    "role_key": "business_continuity_coordinator_employee",
    "display_name": "Business Continuity Coordinator Employee",
    "department": "Security & Safety",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 439,
    "role_key": "esg_reporting_employee",
    "display_name": "ESG Reporting Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "WRI",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 440,
    "role_key": "carbon_accounting_assistant_employee",
    "display_name": "Carbon Accounting Assistant Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 441,
    "role_key": "sustainability_data_employee",
    "display_name": "Sustainability Data Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 442,
    "role_key": "waste_reduction_employee",
    "display_name": "Waste Reduction Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 443,
    "role_key": "water_stewardship_employee",
    "display_name": "Water Stewardship Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 444,
    "role_key": "environmental_compliance_employee",
    "display_name": "Environmental Compliance Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 445,
    "role_key": "supplier_sustainability_employee",
    "display_name": "Supplier Sustainability Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 446,
    "role_key": "social_impact_monitoring_employee",
    "display_name": "Social Impact Monitoring Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 447,
    "role_key": "climate_risk_employee",
    "display_name": "Climate Risk Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 448,
    "role_key": "sustainability_disclosure_employee",
    "display_name": "Sustainability Disclosure Employee",
    "department": "ESG & Sustainability",
    "archetypes": [
      "WRI",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 449,
    "role_key": "research_analyst_employee",
    "display_name": "Research Analyst Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 450,
    "role_key": "evidence_review_employee",
    "display_name": "Evidence Review Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 451,
    "role_key": "data_collection_employee",
    "display_name": "Data Collection Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 452,
    "role_key": "trend_detection_employee",
    "display_name": "Trend Detection Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 453,
    "role_key": "competitive_monitoring_employee",
    "display_name": "Competitive Monitoring Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "MON",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 454,
    "role_key": "horizon_scanning_employee",
    "display_name": "Horizon Scanning Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 455,
    "role_key": "policy_research_employee",
    "display_name": "Policy Research Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 456,
    "role_key": "industry_intelligence_employee",
    "display_name": "Industry Intelligence Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 457,
    "role_key": "source_verification_employee",
    "display_name": "Source Verification Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 458,
    "role_key": "research_synthesis_employee",
    "display_name": "Research Synthesis Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "WRI",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 459,
    "role_key": "survey_analysis_employee",
    "display_name": "Survey Analysis Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 460,
    "role_key": "knowledge_curator_employee",
    "display_name": "Knowledge Curator Employee",
    "department": "Research & Intelligence",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 461,
    "role_key": "editorial_planning_employee",
    "display_name": "Editorial Planning Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 462,
    "role_key": "content_production_coordinator_employee",
    "display_name": "Content Production Coordinator Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 463,
    "role_key": "creator_partnership_employee",
    "display_name": "Creator Partnership Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 464,
    "role_key": "audience_insights_employee",
    "display_name": "Audience Insights Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 465,
    "role_key": "media_rights_administration_employee",
    "display_name": "Media Rights Administration Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 466,
    "role_key": "sponsorship_operations_employee",
    "display_name": "Sponsorship Operations Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 467,
    "role_key": "content_licensing_employee",
    "display_name": "Content Licensing Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 468,
    "role_key": "community_management_employee",
    "display_name": "Community Management Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 469,
    "role_key": "publishing_workflow_employee",
    "display_name": "Publishing Workflow Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 470,
    "role_key": "creator_revenue_operations_employee",
    "display_name": "Creator Revenue Operations Employee",
    "department": "Media & Creator Economy",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 471,
    "role_key": "flight_operations_support_employee",
    "display_name": "Flight Operations Support Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 472,
    "role_key": "airport_operations_employee",
    "display_name": "Airport Operations Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 473,
    "role_key": "ground_handling_coordinator_employee",
    "display_name": "Ground Handling Coordinator Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 474,
    "role_key": "baggage_operations_employee",
    "display_name": "Baggage Operations Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 475,
    "role_key": "aircraft_turnaround_employee",
    "display_name": "Aircraft Turnaround Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 476,
    "role_key": "aviation_maintenance_planning_employee",
    "display_name": "Aviation Maintenance Planning Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "PLN",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 477,
    "role_key": "passenger_disruption_support_employee",
    "display_name": "Passenger Disruption Support Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "SUP",
      "EXE"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 478,
    "role_key": "airport_slot_administration_employee",
    "display_name": "Airport Slot Administration Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 479,
    "role_key": "aviation_safety_administration_employee",
    "display_name": "Aviation Safety Administration Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 480,
    "role_key": "air_cargo_operations_employee",
    "display_name": "Air Cargo Operations Employee",
    "department": "Aviation & Airports",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 481,
    "role_key": "pharma_regulatory_documentation_employee",
    "display_name": "Pharma Regulatory Documentation Employee",
    "department": "Pharma & Life Sciences Admin",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 482,
    "role_key": "drug_safety_administration_employee",
    "display_name": "Drug Safety Administration Employee",
    "department": "Pharma & Life Sciences Admin",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 483,
    "role_key": "clinical_trial_administration_employee",
    "display_name": "Clinical Trial Administration Employee",
    "department": "Pharma & Life Sciences Admin",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 484,
    "role_key": "pharma_inventory_employee",
    "display_name": "Pharma Inventory Employee",
    "department": "Pharma & Life Sciences Admin",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 485,
    "role_key": "quality_documentation_employee",
    "display_name": "Quality Documentation Employee",
    "department": "Pharma & Life Sciences Admin",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 486,
    "role_key": "medical_affairs_administration_employee",
    "display_name": "Medical Affairs Administration Employee",
    "department": "Pharma & Life Sciences Admin",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 487,
    "role_key": "pharma_supplier_compliance_employee",
    "display_name": "Pharma Supplier Compliance Employee",
    "department": "Pharma & Life Sciences Admin",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 488,
    "role_key": "product_registration_employee",
    "display_name": "Product Registration Employee",
    "department": "Pharma & Life Sciences Admin",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 489,
    "role_key": "franchise_operations_employee",
    "display_name": "Franchise Operations Employee",
    "department": "Franchise & Multi-site Operations",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 490,
    "role_key": "franchise_compliance_employee",
    "display_name": "Franchise Compliance Employee",
    "department": "Franchise & Multi-site Operations",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 491,
    "role_key": "multi_site_performance_employee",
    "display_name": "Multi-site Performance Employee",
    "department": "Franchise & Multi-site Operations",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R2",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 492,
    "role_key": "store_opening_coordinator_employee",
    "display_name": "Store Opening Coordinator Employee",
    "department": "Franchise & Multi-site Operations",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 493,
    "role_key": "franchise_royalty_administration_employee",
    "display_name": "Franchise Royalty Administration Employee",
    "department": "Franchise & Multi-site Operations",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 494,
    "role_key": "multi_site_standards_audit_employee",
    "display_name": "Multi-site Standards Audit Employee",
    "department": "Franchise & Multi-site Operations",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 495,
    "role_key": "data_quality_employee",
    "display_name": "Data Quality Employee",
    "department": "Data & AI Operations",
    "archetypes": [
      "REV",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  },
  {
    "id": 496,
    "role_key": "data_governance_employee",
    "display_name": "Data Governance Employee",
    "department": "Data & AI Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 497,
    "role_key": "data_catalog_employee",
    "display_name": "Data Catalog Employee",
    "department": "Data & AI Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 498,
    "role_key": "ai_model_operations_employee",
    "display_name": "AI Model Operations Employee",
    "department": "Data & AI Operations",
    "archetypes": [
      "EXE",
      "COA"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L3"
  },
  {
    "id": 499,
    "role_key": "ai_incident_triage_employee",
    "display_name": "AI Incident Triage Employee",
    "department": "Data & AI Operations",
    "archetypes": [
      "EXE",
      "ANA"
    ],
    "risk": "R4",
    "autonomyDefault": "L2",
    "autonomyMax": "L3"
  },
  {
    "id": 500,
    "role_key": "ai_cost_and_usage_employee",
    "display_name": "AI Cost & Usage Employee",
    "department": "Data & AI Operations",
    "archetypes": [
      "ANA",
      "REV"
    ],
    "risk": "R3",
    "autonomyDefault": "L3",
    "autonomyMax": "L4"
  }
];

export function buildRolePack(raw: RawRoleDef): RolePack {
  const isHighRisk = raw.risk === 'R4' || raw.risk === 'R5';
  const approvalPolicy: ApprovalPolicy = isHighRisk ? 'AP.HUMAN_REQUIRED' : 'AP.NONE';

  return {
    schema_version: "2.0.0",
    id: raw.id,
    role_key: raw.role_key,
    display_name: raw.display_name,
    department: raw.department,
    archetypes: raw.archetypes,
    mission: `Execute the ${raw.display_name} role within the ${raw.department} department with full policy compliance, risk limits (${raw.risk}) and human escalation controls.`,
    inputs: ["IN.BUSINESS_METRICS", "IN.STRATEGIC_OBJECTIVES"],
    outputs: ["OUT.EXECUTIVE_REPORT", "OUT.DECISION_SUMMARY"],
    capabilities: [`CAP.${raw.role_key.toUpperCase()}_OPERATIONS`],
    tools: {
      required: ["T.COMM.GMAIL", "T.DOCS.GENERATOR"],
      optional: ["T.CRM.HUBSPOT"]
    },
    permissions: [
      `${raw.department.toLowerCase().replace(/[^a-z0-9]/g, '_')}.read`,
      `${raw.role_key}.execute`,
      'communication.message.send',
      'crm.customer.write'
    ],
    autonomy: {
      default: raw.autonomyDefault,
      maximum: raw.autonomyMax
    },
    risk: {
      level: raw.risk,
      controls: [`RC.${raw.risk}_HUMAN_APPROVAL_ON_MATERIAL`]
    },
    approval_policy: approvalPolicy,
    events: {
      triggers: ["EV.task.assigned"],
      emits: ["EV.task.completed"]
    },
    workflow: {
      primary: `WF.PRIMARY_${raw.role_key.toUpperCase()}`
    },
    kpis: [`KPI.${raw.role_key}_accuracy`, `KPI.${raw.role_key}_latency`],
    acceptance_tests: [
      {
        id: `AT.${raw.id}.01`,
        name: `${raw.display_name} Basic Test`,
        description: `Validates default execution contract for ${raw.role_key}`,
        expectedOutcome: "SUCCESS"
      }
    ],
    version: "1.0.0",
    lifecycle: "certified",
    metadata: {
      source: "Canonical Catalog 500/500",
      source_sheet: raw.department,
      source_row: raw.id + 1,
      generated: true
    }
  };
}

// Generate full 500 Canonical Catalog array dynamically ensuring IDs 1..500
export const CANONICAL_500_ROLES: RolePack[] = RAW_500_ROLES.map(r => buildRolePack(r));
