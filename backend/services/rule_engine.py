from typing import Any, List, Dict, Tuple, Optional

class ComplianceResult(dict):

    """Versatile result object that works as a dict, tuple, and attribute container"""
    def __iter__(self):
        return iter((self["overall_verdict"], self["compliance_score"], self["violations"]))

    @property
    def overall_verdict(self) -> str:
        return self.get("overall_verdict", "PENDING")

    @property
    def compliance_score(self) -> float:
        return self.get("compliance_score", 0.0)

    @property
    def violations(self) -> list:
        return self.get("violations", [])

class RuleEngineService:
    LEGAL_METROLOGY_RULES = [
        {
            "id": "LMR-01",
            "rule_name": "Manufacturer / Packer Identification",
            "legal_clause": "Rule 6(1)(a)",
            "field_target": "mfg_address",
            "description": "Every package must clearly declare the name and complete physical address of the manufacturer, packer, or importer.",
            "severity": "CRITICAL",
            "is_mandatory": True
        },
        {
            "id": "LMR-02",
            "rule_name": "Generic / Common Commodity Name",
            "legal_clause": "Rule 6(1)(b)",
            "field_target": "generic_name",
            "description": "The common or generic name of the commodity contained in the package must be prominently displayed on the principal display panel.",
            "severity": "HIGH",
            "is_mandatory": True
        },
        {
            "id": "LMR-03",
            "rule_name": "Standard Net Quantity & Unit",
            "legal_clause": "Rule 6(1)(c)",
            "field_target": "net_quantity",
            "description": "The net quantity in terms of the standard unit of weight or measure (SI units: g, kg, ml, l) must be declared without deceptive packaging.",
            "severity": "CRITICAL",
            "is_mandatory": True
        },
        {
            "id": "LMR-04",
            "rule_name": "Manufacturing / Packaging Date",
            "legal_clause": "Rule 6(1)(d)",
            "field_target": "mfg_date",
            "description": "The month and year in which the commodity is manufactured or pre-packed must be clearly indicated (e.g., MM/YYYY).",
            "severity": "HIGH",
            "is_mandatory": True
        },
        {
            "id": "LMR-05",
            "rule_name": "Expiry / Best Before Declaration",
            "legal_clause": "Rule 6(1)(d) & FSSAI",
            "field_target": "expiry_date",
            "description": "Perishable and packaged food commodities must state the Best Before or Expiry date for consumer safety.",
            "severity": "CRITICAL",
            "is_mandatory": True
        },
        {
            "id": "LMR-06",
            "rule_name": "Maximum Retail Price (MRP) & USP",
            "legal_clause": "Rule 6(1)(e)",
            "field_target": "mrp",
            "description": "The retail sale price of the package in the form 'MRP Rs. XX.XX (incl. of all taxes)' along with Unit Sale Price (USP) for multi-unit / net mass items.",
            "severity": "CRITICAL",
            "is_mandatory": True
        },
        {
            "id": "LMR-07",
            "rule_name": "Consumer Redressal Contacts",
            "legal_clause": "Rule 6(1)(k)",
            "field_target": "consumer_care",
            "description": "Name, complete address, telephone number, and email address of the designated consumer care officer must be printed for grievances.",
            "severity": "HIGH",
            "is_mandatory": True
        },
        {
            "id": "LMR-08",
            "rule_name": "Mandatory Country of Origin",
            "legal_clause": "Rule 6(1)(n)",
            "field_target": "country_origin",
            "description": "The country of origin or manufacturing must be explicitly declared (e.g., 'Made in India' or 'Country of Origin: India').",
            "severity": "CRITICAL",
            "is_mandatory": True
        }
    ]

    @classmethod
    def evaluate_compliance(cls, extracted_fields: Any) -> ComplianceResult:
        """
        Evaluates extracted declarations against all codified Legal Metrology rules.
        Accepts either a List of field dicts or a Dict mapping field_type -> field dict.
        Returns a versatile ComplianceResult object.
        """
        if isinstance(extracted_fields, dict):
            field_list = list(extracted_fields.values())
        elif isinstance(extracted_fields, list):
            field_list = extracted_fields
        else:
            field_list = []

        field_map = {}
        for f in field_list:
            if isinstance(f, dict):
                field_map[f.get("field_type")] = f

        violations = []
        passed_rules_count = 0
        total_rules = len(cls.LEGAL_METROLOGY_RULES)

        for rule in cls.LEGAL_METROLOGY_RULES:
            target = rule["field_target"]
            field_data = field_map.get(target)

            if not field_data or not field_data.get("is_valid", False):
                # Violation detected
                raw_text = field_data.get("raw_text") if field_data else None
                issue_title = f"Non-Compliance: {rule['rule_name']}"
                desc = field_data.get("validation_message") if field_data else rule["description"]
                
                violations.append({
                    "rule_id": rule["id"],
                    "field_type": target,
                    "clause": rule["legal_clause"],
                    "issue_title": issue_title,
                    "description": desc,
                    "severity": rule["severity"],
                    "evidence_snippet": raw_text or "[Declaration Omitted / Not Detected on Packaging]"
                })
            else:
                passed_rules_count += 1

        compliance_score = round((passed_rules_count / total_rules) * 100.0, 1)
        overall_verdict = "COMPLIANT" if len(violations) == 0 else "NON_COMPLIANT"

        return ComplianceResult({
            "overall_verdict": overall_verdict,
            "compliance_score": compliance_score,
            "violations": violations,
            "passed_rules_count": passed_rules_count,
            "total_rules": total_rules
        })

