import { neo4jService } from '../db/neo4j.ts';

export interface SseClient {
  id: string;
  res: any;
}

class EventBroadcaster {
  private clients: Map<string, any> = new Map();

  public addClient(id: string, res: any) {
    this.clients.set(id, res);
    console.log(`📡 SSE client connected: ${id} (Active: ${this.clients.size})`);
  }

  public removeClient(id: string) {
    this.clients.delete(id);
    console.log(`🔌 SSE client disconnected: ${id} (Active: ${this.clients.size})`);
  }

  public broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [id, res] of this.clients.entries()) {
      try {
        res.write(payload);
      } catch (e) {
        this.clients.delete(id);
      }
    }
  }

  public heartbeat() {
    for (const [id, res] of this.clients.entries()) {
      try {
        res.write(': keep-alive\n\n');
      } catch (e) {
        this.clients.delete(id);
      }
    }
  }

  public getActiveCount(): number {
    return this.clients.size;
  }
}

export const sseBroadcaster = new EventBroadcaster();

// Start periodic heartbeat every 25 seconds to keep Render / proxy connections open
setInterval(() => {
  sseBroadcaster.heartbeat();
}, 25000);

export class MutationEngine {
  /**
   * Publish an asset (Creation Firewall override or standard publish)
   */
  public async publishAsset(params: {
    title: string;
    content: string;
    actor: string;
    role: string;
    complianceScore: number;
    bypassedRules?: any[];
    channel?: string;
  }) {
    const result = await neo4jService.addAsset({
      title: params.title,
      content: params.content,
      actor: `${params.actor} (${params.role})`,
      complianceScore: params.complianceScore,
      bypassedRules: params.bypassedRules,
      channel: params.channel || 'LinkedIn Ads'
    });

    // Broadcast live graph mutation event via SSE
    sseBroadcaster.broadcast('asset_published', {
      asset: result.asset,
      totalAssets: result.totalAssets,
      timestamp: new Date().toISOString()
    });

    sseBroadcaster.broadcast('drift_update', {
      latestAsset: result.asset,
      complianceScore: params.complianceScore,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Get ripple graph for BrandForensics
   */
  public async getRippleGraph(rootFactId = 'FACT-001') {
    return neo4jService.getRippleGraph(rootFactId);
  }

  /**
   * Propose remediation diffs
   */
  public async getProposals(targetFactId = 'FACT-001') {
    return neo4jService.proposeRemediation(targetFactId);
  }

  /**
   * Execute approved systemic remediation patch
   */
  public async executePatch(params: {
    actor: string;
    role: string;
    targetFactId?: string;
  }) {
    const patchResult = await neo4jService.executeRemediationPatch({
      actor: params.actor,
      role: params.role,
      targetFactId: params.targetFactId
    });

    // Broadcast patch execution event
    sseBroadcaster.broadcast('patch_executed', {
      patchResult,
      timestamp: new Date().toISOString()
    });

    // Also notify drift radar that assets were remediated to high score
    sseBroadcaster.broadcast('drift_update', {
      remediationTx: patchResult.transactionId,
      succeeded: patchResult.succeeded,
      timestamp: new Date().toISOString()
    });

    return patchResult;
  }
}

export const mutationEngine = new MutationEngine();
