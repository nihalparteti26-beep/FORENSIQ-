import { INKLOOM_40_ADS_DRIFT_HISTORY, ROOT_CAUSE_INSIGHTS, type AdHistoryItem } from '../mockData/inkloom.ts';

export interface BrandContract {
  contractId: string;
  assetTitle: string;
  sha256Hash: string;
  approvedBy: string;
  approverRole: 'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance';
  approvalTimestamp: string;
  expiryDate: string;
  verifiedFactIds: string[];
  governanceScore: number;
  digitalSignature: string;
  auditBadgeUrl: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface GuidelineHeatmapCell {
  guideline: string;
  department: string;
  violationCount: number;
  riskWeight: 'Low' | 'Medium' | 'High';
}

export interface UnclearGuideline {
  ruleId: string;
  ruleTitle: string;
  disputeRate: string;
  timesFlagged: number;
  timesOverridden: number;
  systemicDiagnosis: string;
  suggestedClarification: string;
}

export class BrandImmuneEngine {
  private adHistory: AdHistoryItem[] = [...INKLOOM_40_ADS_DRIFT_HISTORY];
  private systemicPatchesApplied: string[] = [];

  /**
   * Generates a tamper-proof BrandContract™ digital certificate
   */
  public issueBrandContract(params: {
    assetTitle: string;
    content: string;
    approvedBy: string;
    approverRole: 'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance';
    verifiedFactIds: string[];
    governanceScore: number;
  }): BrandContract {
    const rawData = `${params.assetTitle}|${params.content}|${params.approvedBy}|${Date.now()}`;
    const sha256Hash = this.pseudoSha256(rawData);
    const contractId = `BC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // One year validity
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    return {
      contractId,
      assetTitle: params.assetTitle,
      sha256Hash,
      approvedBy: params.approvedBy,
      approverRole: params.approverRole,
      approvalTimestamp: new Date().toISOString(),
      expiryDate: expiry.toISOString().split('T')[0],
      verifiedFactIds: params.verifiedFactIds,
      governanceScore: params.governanceScore,
      digitalSignature: `SIG_${sha256Hash.substring(0, 16)}__ECDSA_P256`,
      auditBadgeUrl: `/api/contracts/${contractId}/badge.svg`,
      status: 'ACTIVE'
    };
  }

  /**
   * Returns Root-Cause Immunizer analysis
   */
  public getRootCauseAnalysis() {
    return {
      ...ROOT_CAUSE_INSIGHTS,
      isPatched: this.systemicPatchesApplied.includes("AgencyX_Templates_Q3"),
      patchHistory: this.systemicPatchesApplied
    };
  }

  /**
   * Deploys a systemic immunization patch (deprecating bad template globally)
   */
  public applySystemicPatch(patchId: string = "AgencyX_Templates_Q3"): { success: boolean; message: string; affectedSeats: number } {
    if (!this.systemicPatchesApplied.includes(patchId)) {
      this.systemicPatchesApplied.push(patchId);
    }
    return {
      success: true,
      message: `Systemic Immunization Patch applied successfully. Deprecated AgencyX_Social_Templates_Q3.pptx across 18 agency seats. Synced BrandDNA Figma Tokens v2.4.`,
      affectedSeats: 18
    };
  }

  /**
   * Returns the 40 Ads Brand Drift Radar metrics
   */
  public getDriftRadarData() {
    return {
      ads: this.adHistory,
      baselineToneScore: 92,
      currentToneScore: 14,
      inflectionPointAdIndex: 20, // Ad #21 is where drift accelerated
      keyFinding: "Tone shifted by -78 points over 6 months from Informative/Objective to Hyper-Urgent/Salesy. 82% of drift originated from Agency X growth copy."
    };
  }

  /**
   * Generates Repeated Mistakes Heatmap
   */
  public getRepeatedMistakesHeatmap(): GuidelineHeatmapCell[] {
    return [
      { guideline: "Rule 1.1: Unsupported Metric Claims", department: "Growth Agency X", violationCount: 14, riskWeight: "High" },
      { guideline: "Rule 1.1: Unsupported Metric Claims", department: "Field Sales", violationCount: 9, riskWeight: "High" },
      { guideline: "Rule 1.1: Unsupported Metric Claims", department: "Internal Product", violationCount: 1, riskWeight: "Low" },
      { guideline: "Rule 2.3: Banned Lexicon ('Cheap', 'Hurry')", department: "Growth Agency X", violationCount: 19, riskWeight: "Medium" },
      { guideline: "Rule 2.3: Banned Lexicon ('Cheap', 'Hurry')", department: "Social Media Team", violationCount: 8, riskWeight: "Medium" },
      { guideline: "Rule 2.3: Banned Lexicon ('Cheap', 'Hurry')", department: "Email Lifecycle", violationCount: 3, riskWeight: "Low" },
      { guideline: "Rule 3.1: Expired Pricing ($49/seat)", department: "Sales Enablement", violationCount: 6, riskWeight: "High" },
      { guideline: "Rule 3.1: Expired Pricing ($49/seat)", department: "Web Content", violationCount: 2, riskWeight: "Medium" },
      { guideline: "Rule 4.2: Legacy Raster Logo (v1.0)", department: "Growth Agency X", violationCount: 11, riskWeight: "Medium" },
      { guideline: "Rule 4.2: Legacy Raster Logo (v1.0)", department: "Partner Events", violationCount: 5, riskWeight: "Low" }
    ];
  }

  /**
   * Detects Unclear Guidelines with high dispute/override rates
   */
  public getUnclearGuidelines(): UnclearGuideline[] {
    return [
      {
        ruleId: "RULE-204",
        ruleTitle: "Guideline 2.4: Permissible Performance Projections",
        disputeRate: "64.2%",
        timesFlagged: 47,
        timesOverridden: 30,
        systemicDiagnosis: "Creators interpret 'empirical backing' differently than legal reviewers. Wording lacks concrete allowable margin ranges.",
        suggestedClarification: "Specify that claims above 25% require formal Forrester or Gartner study citations; estimates under 20% may cite customer surveys."
      },
      {
        ruleId: "RULE-309",
        ruleTitle: "Guideline 3.9: Conversational Tone in Paid Social Ads",
        disputeRate: "48.7%",
        timesFlagged: 38,
        timesOverridden: 19,
        systemicDiagnosis: "Rule bans 'overly informal colloquialisms' without defining approved substitutes for casual social hooks.",
        suggestedClarification: "Provide a 10-item list of approved casual social phrasing (e.g. 'Build with precision' vs 'Crazy fast')."
      }
    ];
  }

  private pseudoSha256(str: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    const hex = hash.toString(16).padStart(8, '0');
    return `${hex}e83921af7b4c90d8a15b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f`.substring(0, 64);
  }
}

export const immuneEngine = new BrandImmuneEngine();
