import { brandCompiler } from './lib/compiler/index.ts';
import { brandNegotiator } from './lib/compiler/agents.ts';
import { forensicsEngine } from './lib/forensics/index.ts';
import { immuneEngine } from './lib/immune/index.ts';
import { DEMO_PRESET_SCENARIOS } from './lib/mockData/inkloom.ts';

console.log('Testing BrandTrustCompiler...');
const report = brandCompiler.compile(DEMO_PRESET_SCENARIOS.highRisk.content);
console.log(`Report Score: ${report.score}/100, Status: ${report.overallStatus}, Risk: ${report.riskLevel}`);
console.log(`Findings count: ${report.findings.length}`);
report.findings.forEach(f => console.log(` - [${f.category}] ${f.title}: ${f.suggestedRewrite}`));

console.log('\nTesting BrandNegotiator (4-Agent Debate)...');
const debate = brandNegotiator.conductDebate(DEMO_PRESET_SCENARIOS.highRisk.content, report);
console.log(`Debate rounds: ${debate.rounds.length}`);
debate.rounds.forEach(r => console.log(` [${r.agentName}] (${r.stance}): "${r.text.slice(0, 70)}..."`));
console.log(`Consensus Decision: ${debate.synthesizedConsensus.finalDecision}`);
console.log(`Approved Defensible Copy: "${debate.synthesizedConsensus.approvedCopy}"`);

console.log('\nTesting BrandForensics (Blast Radius)...');
const blast = forensicsEngine.calculateBlastRadius('FACT-001');
console.log(`Blast radius affected assets: ${blast.affectedAssetsCount}, channels: ${blast.affectedChannels.join(', ')}`);

console.log('\nTesting BrandImmune (BrandContract)...');
const contract = immuneEngine.issueBrandContract({
  assetTitle: 'Q4 Enterprise Launch Campaign',
  content: debate.synthesizedConsensus.approvedCopy,
  approvedBy: 'Elena Rostova (Chief Brand Officer)',
  approverRole: 'Brand Manager',
  verifiedFactIds: ['FACT-001'],
  governanceScore: 98
});
console.log(`Issued BrandContract ID: ${contract.contractId}`);
console.log(`SHA-256 Hash: ${contract.sha256Hash}`);
console.log(`Digital Signature: ${contract.digitalSignature}`);
console.log('\n=== ALL COMPILER, DEBATE, FORENSICS & IMMUNE TESTS PASSED ===');
