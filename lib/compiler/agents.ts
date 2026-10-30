import type { CompilerReport, CompilerFinding } from './index.ts';

export interface AgentMessage {
  id: string;
  agentRole: 'Creator' | 'Evidence' | 'Guardian' | 'Risk';
  agentName: string;
  avatar: string;
  color: string;
  timestamp: string;
  text: string;
  stance: 'defend' | 'challenge' | 'compromise' | 'ruling';
}

export interface MultiAgentDebateResult {
  topic: string;
  rounds: AgentMessage[];
  synthesizedConsensus: {
    finalDecision: 'PASS' | 'CONDITIONAL_APPROVAL' | 'REVISE_INTENT';
    riskScore: 'Low' | 'Medium' | 'High';
    approvedCopy: string;
    preservedIntentStatement: string;
    rationale: string;
  };
}

export class BrandNegotiator {
  /**
   * Simulates a 4-Agent Debate on any content draft
   */
  public conductDebate(content: string, report: CompilerReport): MultiAgentDebateResult {
    const findings = report.findings;
    const hasUnsupportedClaim = findings.some(f => f.category === 'Claim Evidence');
    const hasUrgency = findings.some(f => f.category === 'Tone');
    const hasBannedWords = findings.some(f => f.category === 'Terminology');

    const rounds: AgentMessage[] = [];

    // Round 1: Creator Agent opens defending campaign velocity & conversion hook
    rounds.push({
      id: "MSG-01",
      agentRole: "Creator",
      agentName: "Maya (Creator Agent)",
      avatar: "🎨",
      color: "blue",
      timestamp: "0.2s ago",
      stance: "defend",
      text: hasUnsupportedClaim
        ? `We need bold claims to stand out against incumbent competitors in Q4. '40% efficiency' and strong urgency hooks drive a 2.4x click-through rate in early ad testing. Watering this down kills conversion.`
        : `This draft captures the essence of our platform launch with strong hooks and clear customer value. We should ship immediately to hit the release deadline.`
    });

    // Round 2: Evidence Agent checks BrandDNA knowledge graph and vector evidence
    rounds.push({
      id: "MSG-02",
      agentRole: "Evidence",
      agentName: "Dr. Ethan (Evidence Agent)",
      avatar: "🔍",
      color: "cyan",
      timestamp: "0.4s ago",
      stance: "challenge",
      text: hasUnsupportedClaim
        ? `I just queried BrandDNA Vector Collection. We have zero empirical backing for '40% efficiency'. Our verified benchmark from Forrester TEI Study 2023 is '25% time savings' (Source: p. 14, verified by Sarah Chen). Making a 40% claim is unverified.`
        : `Verified across BrandDNA. Core claims match our Q2 customer telemetry and Forrester benchmarks with >95% confidence score.`
    });

    // Round 3: Guardian Agent checks editorial standards & tone drift
    rounds.push({
      id: "MSG-03",
      agentRole: "Guardian",
      agentName: "Sloan (Guardian Agent)",
      avatar: "🛡️",
      color: "indigo",
      timestamp: "0.7s ago",
      stance: "compromise",
      text: hasUrgency || hasBannedWords
        ? `Brand guidelines rule 3.4 strictly bans terms like 'cheap', 'miracle', and artificial urgency like 'ACT NOW'. We've seen Brand Drift over the last 40 ads skewing from authoritative to spammy. But we can preserve Maya's punchy call-to-action without diluting enterprise trust.`
        : `Visual tokens and editorial voice adhere to Brand System v3.2. No banned lexicon detected in the body copy.`
    });

    // Round 4: Risk Agent scores legal exposure & regulatory liability
    rounds.push({
      id: "MSG-04",
      agentRole: "Risk",
      agentName: "Justice (Legal Risk Agent)",
      avatar: "⚖️",
      color: "rose",
      timestamp: "1.1s ago",
      stance: "ruling",
      text: hasUnsupportedClaim
        ? `FTC Section 5 rules are strict on uncorroborated performance percentages. An unsubstantiated 40% claim creates severe class-action exposure and competitor challenges. However, 'up to 25% verified efficiency' is 100% legally defensible under our Forrester study audit trail. Let's rewrite preserving Maya's energetic structure.`
        : `Legal liability scored at LOW. No FTC or copyright exposure identified in this draft.`
    });

    // Round 5: Consensus Synthesis
    let approvedCopy = content;
    if (hasUnsupportedClaim) {
      approvedCopy = approvedCopy.replace(/40%\s+(?:more\s+)?(?:efficient|efficiency|faster)/gi, 'up to 25% efficiency gains');
    }
    if (hasBannedWords || hasUrgency) {
      approvedCopy = approvedCopy
        .replace(/cheap/gi, 'cost-effective')
        .replace(/miracle/gi, 'proven automated')
        .replace(/insane/gi, 'measurable')
        .replace(/act now[!]?/gi, 'schedule your enterprise architecture review')
        .replace(/hurry[!]?/gi, 'explore rollout schedule');
    }

    const synthesizedConsensus = {
      finalDecision: (report.overallStatus === 'PASS' ? 'PASS' : report.overallStatus === 'CONDITIONAL' ? 'CONDITIONAL_APPROVAL' : 'REVISE_INTENT') as 'PASS' | 'CONDITIONAL_APPROVAL' | 'REVISE_INTENT',
      riskScore: report.riskLevel,
      approvedCopy,
      preservedIntentStatement: "Creator's high-impact conversion objective is fully preserved while anchoring claim to Forrester's verified 25% audit trail.",
      rationale: "Unanimous alignment reached: Creative velocity maintained with zero regulatory liability."
    };

    return {
      topic: `Pre-Publish BrandTrust Consensus: "${content.slice(0, 48)}..."`,
      rounds,
      synthesizedConsensus
    };
  }
}

export const brandNegotiator = new BrandNegotiator();
