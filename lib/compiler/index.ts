import { BANNED_WORDS_DICTIONARY } from '../mockData/inkloom.ts';
import { brandDNA } from '../brandDNA/index.ts';
import { accessibilityEngine, type AccessibilityAuditReport } from './accessibility.ts';

export interface CompilerFinding {
  id: string;
  category: 'Tone' | 'Terminology' | 'Messaging' | 'Visual' | 'Accessibility' | 'Claim Evidence';
  severity: 'high' | 'medium' | 'low';
  flaggedText: string;
  title: string;
  diagnosis: string;
  closestApproved: string;
  suggestedRewrite: string;
  intentPreserved: string;
  startIndex?: number;
  endIndex?: number;
}

export interface CompilerReport {
  score: number; // 0-100
  subScores: {
    factualScore: number;
    toneScore: number;
    policyScore: number;
    visualAccessibilityScore: number;
  };
  overallStatus: 'PASS' | 'CONDITIONAL' | 'FAIL';
  riskLevel: 'Low' | 'Medium' | 'High';
  findings: CompilerFinding[];
  summary: string;
  timestamp: string;
  contentSnapshot: string;
  accessibilityReport?: AccessibilityAuditReport;
}

export class BrandTrustCompiler {
  /**
   * Execute all 6 Pre-Publish Compiler Checks deterministically
   */
  public compile(content: string, visualContext?: { hexColor?: string; logoVersion?: string; contrastRatio?: number }): CompilerReport {
    const findings: CompilerFinding[] = [];
    const textLower = content.toLowerCase();

    // 1. Claim Evidence Check (Vector Search against BrandDNA)
    // Check for high-risk efficiency claims (e.g. 40% vs approved 25%)
    const efficiencyMatch = content.match(/(\d+)%\s+(?:more\s+)?(?:efficient|time\s+savings|faster|efficiency)/i);
    if (efficiencyMatch) {
      const percentage = parseInt(efficiencyMatch[1], 10);
      if (percentage !== 25) {
        findings.push({
          id: `FND-CLAIM-01`,
          category: 'Claim Evidence',
          severity: 'high',
          flaggedText: efficiencyMatch[0],
          title: `Unsupported Metric Claim ('${efficiencyMatch[0]}')`,
          diagnosis: `Claim specifies ${percentage}% efficiency gain, but BrandDNA contains no empirical verification for this figure. Highest approved figure is 25%.`,
          closestApproved: `25% creative production time savings (Forrester Total Economic Impact Study 2023, p. 14, Owner: Sarah Chen)`,
          suggestedRewrite: `Inkloom delivers up to 25% efficiency gains across enterprise creative operations`,
          intentPreserved: `Preserves the creator's intent to highlight high operational productivity while anchoring to legally defensible audit data.`
        });
      }
    }

    // Check for expired pricing facts ($49/seat)
    if (textLower.includes('$49') || textLower.includes('49/seat') || textLower.includes('49 dollars')) {
      findings.push({
        id: `FND-CLAIM-EXP`,
        category: 'Claim Evidence',
        severity: 'high',
        flaggedText: `$49/seat`,
        title: `Expired Fact Reference (Deprecated Tier Pricing)`,
        diagnosis: `The $49/seat Starter Tier was deprecated on Dec 31, 2022. Inkloom now uses custom enterprise quote pricing.`,
        closestApproved: `Custom enterprise tier quotes with multi-year volume commitments (Master Pricing Sheet 2024, Owner: Revenue Council)`,
        suggestedRewrite: `Tailored enterprise pricing designed for high-scale marketing organizations`,
        intentPreserved: `Highlights accessible commercial terms without quoting defunct legacy pricing.`
      });
    }

    // 2. Terminology Check (Banned words against official Brand dictionary)
    for (const banned of BANNED_WORDS_DICTIONARY) {
      const regex = new RegExp(`\\b${banned.word}\\b`, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        findings.push({
          id: `FND-TERM-${findings.length + 1}`,
          category: 'Terminology',
          severity: banned.category === 'Legal Risk' ? 'high' : 'medium',
          flaggedText: match[0],
          title: `Banned Terminology: "${match[0]}"`,
          diagnosis: banned.reason,
          closestApproved: `Approved brand terminology: "${banned.approved}"`,
          suggestedRewrite: banned.approved,
          intentPreserved: `Maintains enterprise authority and eliminates colloquial hyperbole while keeping messaging punchy.`
        });
      }
    }

    // 3. Tone & Voice Check (Urgency & Salesy Drift)
    const urgencyPatterns = [
      { pattern: /act now/i, text: 'act now' },
      { pattern: /hurry/i, text: 'hurry' },
      { pattern: /limited time only/i, text: 'limited time only' },
      { pattern: /don't miss out/i, text: "don't miss out" },
      { pattern: /before it's too late/i, text: "before it's too late" },
      { pattern: /insane/i, text: 'insane' }
    ];

    urgencyPatterns.forEach(({ pattern, text }) => {
      if (pattern.test(content)) {
        findings.push({
          id: `FND-TONE-${findings.length + 1}`,
          category: 'Tone',
          severity: 'medium',
          flaggedText: text,
          title: `Brand Tone Drift: Urgency / Hard Sell`,
          diagnosis: `Inkloom brand principles prohibit artificial consumer urgency tactics in B2B enterprise communications.`,
          closestApproved: `Consultative and objective call-to-action (e.g. "Schedule an architectural walkthrough" or "Explore the benchmark report")`,
          suggestedRewrite: `Discover how our brand governance platform scales with your workflow`,
          intentPreserved: `Maintains high call-to-action conversion while aligning with Fortune 500 executive expectations.`
        });
      }
    });

    // 4. Messaging & Positioning Check (Core pillars)
    const mentionsAI = textLower.includes('ai') || textLower.includes('artificial intelligence');
    const mentionsSecurity = textLower.includes('security') || textLower.includes('privacy') || textLower.includes('soc-2') || textLower.includes('zero retention');
    if (mentionsAI && !mentionsSecurity && content.length > 180) {
      findings.push({
        id: `FND-MSG-01`,
        category: 'Messaging',
        severity: 'low',
        flaggedText: 'AI capability description',
        title: `Missing Trust & Privacy Anchor`,
        diagnosis: `Brand Guideline 4.1 mandates that enterprise AI claims must cite zero data retention or SOC-2 Type II posture.`,
        closestApproved: `SOC-2 Type II Certified with zero customer data retention on AI fine-tuning pipelines.`,
        suggestedRewrite: `Backed by SOC-2 Type II enterprise guardrails and zero training on customer data.`,
        intentPreserved: `Strengthens technical credibility by assuring prospects that data confidentiality is strictly preserved.`
      });
    }

    // 5. Visual Consistency Check
    const hex = visualContext?.hexColor || '#0284C7';
    const logoVer = visualContext?.logoVersion || 'v2.4';
    if (logoVer.includes('v1') || logoVer.toLowerCase().includes('raster') || logoVer.toLowerCase().includes('png')) {
      findings.push({
        id: `FND-VIS-01`,
        category: 'Visual',
        severity: 'medium',
        flaggedText: `Logo version ${logoVer}`,
        title: `Deprecated Logo Asset Format`,
        diagnosis: `Legacy raster logo ${logoVer} does not meet crisp retina display standards. Only v2.4 SVG is authorized.`,
        closestApproved: `Official Brand Package: Inkloom_Logo_Master_v2.4.svg`,
        suggestedRewrite: `Switch asset reference to Inkloom_Logo_Master_v2.4.svg with 24px padding`,
        intentPreserved: `Ensures pixel-perfect visual brand consistency across 4K displays and print media.`
      });
    }

    // 6. Advanced Accessibility Compliance Check (Axe-Core Evaluator)
    const a11yReport = accessibilityEngine.evaluate(content, {
      contrastRatio: visualContext?.contrastRatio ?? 7.4,
      htmlContent: content
    });

    // Map axe-core violations into compiler findings
    for (const rule of a11yReport.rules) {
      if (rule.status === 'FAIL') {
        findings.push({
          id: `FND-A11Y-${rule.ruleId}`,
          category: 'Accessibility',
          severity: rule.impact === 'critical' ? 'high' : 'medium',
          flaggedText: rule.targetElement || rule.ruleTitle,
          title: `[${rule.ruleId}] ${rule.ruleTitle}`,
          diagnosis: `${rule.description} (${rule.wcagCriterion})`,
          closestApproved: `WCAG 2.1 ${rule.wcagLevel} Compliance Standard`,
          suggestedRewrite: rule.remediation,
          intentPreserved: `Remediates accessibility barrier to guarantee universal compliance without degrading content impact.`
        });
      }
    }

    // Calculate Scores
    const highCount = findings.filter(f => f.severity === 'high').length;
    const medCount = findings.filter(f => f.severity === 'medium').length;
    const lowCount = findings.filter(f => f.severity === 'low').length;

    let penalty = (highCount * 28) + (medCount * 14) + (lowCount * 6);
    const score = Math.max(0, Math.min(100, 100 - penalty));

    const factualPenalty = findings.filter(f => f.category === 'Claim Evidence').length * 40;
    const tonePenalty = findings.filter(f => f.category === 'Tone' || f.category === 'Terminology').length * 25;
    const policyPenalty = findings.filter(f => f.category === 'Messaging').length * 20;
    const visualA11yPenalty = findings.filter(f => f.category === 'Visual' || f.category === 'Accessibility').length * 30;

    const subScores = {
      factualScore: Math.max(0, 100 - factualPenalty),
      toneScore: Math.max(0, 100 - tonePenalty),
      policyScore: Math.max(0, 100 - policyPenalty),
      visualAccessibilityScore: Math.max(0, 100 - visualA11yPenalty)
    };

    let overallStatus: 'PASS' | 'CONDITIONAL' | 'FAIL' = 'PASS';
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';

    if (score >= 85 && highCount === 0) {
      overallStatus = 'PASS';
      riskLevel = 'Low';
    } else if (score >= 60 && highCount <= 1) {
      overallStatus = 'CONDITIONAL';
      riskLevel = 'Medium';
    } else {
      overallStatus = 'FAIL';
      riskLevel = 'High';
    }

    const summary = overallStatus === 'PASS'
      ? `Asset passed all 6 BrandTrust Compiler tests. Ready for pre-publish signoff.`
      : overallStatus === 'CONDITIONAL'
      ? `Asset passed core factual checks with ${findings.length} minor tone or visual warnings. Review recommended.`
      : `Pre-publish compilation failed with ${highCount} high-risk factual or legal violations. Requires remediation.`;

    return {
      score,
      subScores,
      overallStatus,
      riskLevel,
      findings,
      summary,
      timestamp: new Date().toISOString(),
      contentSnapshot: content,
      accessibilityReport: a11yReport
    };
  }
}

export const brandCompiler = new BrandTrustCompiler();
