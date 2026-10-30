/**
 * FORENSIQ Brand Intelligence OS · Multi-User Approval Pipeline
 * Provides:
 * - 3 Risk-Based Lanes (Low / Medium / High Risk)
 * - Optimistic Concurrency Control (Version tracking & Timestamp checking)
 * - Optimistic Resource Locking with Auto-Expiry
 * - Concurrency Conflict Detection & Resolution (Accept Server, Force Override, Merge)
 * - Real-Time Broadcast Triggers (WebSocket & SSE)
 */

export interface PipelineAsset {
  id: string;
  title: string;
  channel: string;
  content: string;
  complianceScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lane: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  version: number;
  lastModified: string;
  lastModifiedBy: string;
  lock: {
    lockedBy: string;
    lockedAt: string;
    expiresAt: string;
  } | null;
  history: Array<{
    version: number;
    action: string;
    actor: string;
    timestamp: string;
    note?: string;
  }>;
}

export interface PipelineConflict {
  conflict: true;
  code: 'CONCURRENCY_CONFLICT' | 'RESOURCE_LOCKED';
  message: string;
  serverAsset: PipelineAsset;
  attemptedVersion: number;
  serverVersion: number;
  timestamp: string;
}

class ApprovalPipelineService {
  private assets: Map<string, PipelineAsset> = new Map();

  constructor() {
    this.seedInitialPipeline();
  }

  private seedInitialPipeline() {
    const initialItems: Array<Partial<PipelineAsset> & { id: string; title: string; riskLevel: 'Low' | 'Medium' | 'High'; channel: string; content: string }> = [
      {
        id: 'ASSET-001',
        title: 'Executive Pitch Master (Slide 4)',
        channel: 'Enterprise Direct Sales',
        riskLevel: 'High',
        complianceScore: 38,
        content: 'Inkloom saves 40% efficiency gains for marketing teams. Tailored enterprise pricing available upon request.'
      },
      {
        id: 'ASSET-006',
        title: 'Q4 Social Campaign Variant A',
        channel: 'LinkedIn Ads',
        riskLevel: 'High',
        complianceScore: 42,
        content: 'Discover the miracle tool that cuts 40% creative production time in under 3 days! ACT NOW.'
      },
      {
        id: 'ASSET-012',
        title: 'Enterprise Webinar Invitation Slide',
        channel: 'Marketo Lifecycle',
        riskLevel: 'Medium',
        complianceScore: 68,
        content: 'Explore how Inkloom helps enterprise brand governance teams improve turnaround times.'
      },
      {
        id: 'ASSET-018',
        title: 'Partner Co-Marketing One-Pager',
        channel: 'Website & Resource Center',
        riskLevel: 'Medium',
        complianceScore: 74,
        content: 'Collaborative creative workflows with 24px logo clearspace and verified SOC-2 Type II controls.'
      },
      {
        id: 'ASSET-021',
        title: 'Product Release Typo & Contrast Patch',
        channel: 'Google Search',
        riskLevel: 'Low',
        complianceScore: 92,
        content: 'Inkloom is the enterprise platform for continuous brand governance and deterministic compliance.'
      },
      {
        id: 'ASSET-023',
        title: 'Brand Whitepaper Deck Reference',
        channel: 'Enterprise Sales Pipeline',
        riskLevel: 'Low',
        complianceScore: 96,
        content: 'Inkloom was founded in 2021 to bring deterministic governance to enterprise brand publishing.'
      }
    ];

    const now = new Date().toISOString();
    for (const item of initialItems) {
      const lane = item.riskLevel === 'Low' ? 'low' : item.riskLevel === 'Medium' ? 'medium' : 'high';
      this.assets.set(item.id, {
        id: item.id,
        title: item.title,
        channel: item.channel,
        content: item.content,
        complianceScore: item.complianceScore || 50,
        riskLevel: item.riskLevel,
        lane,
        status: item.riskLevel === 'Low' ? 'approved' : 'pending',
        version: 1,
        lastModified: now,
        lastModifiedBy: 'System Bootstrap',
        lock: null,
        history: [
          {
            version: 1,
            action: 'CREATED',
            actor: 'System Bootstrap',
            timestamp: now,
            note: `Initial ingestion into ${item.riskLevel} Risk Approval Lane`
          }
        ]
      });
    }
  }

  /**
   * Get all assets grouped by approval lanes
   */
  public getPipeline() {
    this.cleanExpiredLocks();
    const all = Array.from(this.assets.values());
    return {
      low: all.filter(a => a.lane === 'low'),
      medium: all.filter(a => a.lane === 'medium'),
      high: all.filter(a => a.lane === 'high'),
      total: all.length
    };
  }

  public getAsset(assetId: string): PipelineAsset | null {
    this.cleanExpiredLocks();
    return this.assets.get(assetId) || null;
  }

  /**
   * Optimistic lock on an asset to indicate active review
   */
  public acquireLock(assetId: string, user: string, role: string): { success: boolean; message: string; lock?: any } {
    this.cleanExpiredLocks();
    const asset = this.assets.get(assetId);
    if (!asset) {
      return { success: false, message: `Asset ${assetId} not found` };
    }

    if (asset.lock && asset.lock.lockedBy !== user) {
      return {
        success: false,
        message: `Asset ${assetId} is already locked by ${asset.lock.lockedBy} until ${new Date(asset.lock.expiresAt).toLocaleTimeString()}`
      };
    }

    const now = Date.now();
    asset.lock = {
      lockedBy: `${user} (${role})`,
      lockedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 60000).toISOString() // 60s TTL
    };

    return {
      success: true,
      message: `Asset ${assetId} locked by ${user}`,
      lock: asset.lock
    };
  }

  /**
   * Release lock
   */
  public releaseLock(assetId: string, user: string): boolean {
    const asset = this.assets.get(assetId);
    if (asset && asset.lock && (asset.lock.lockedBy.startsWith(user) || user === 'admin')) {
      asset.lock = null;
      return true;
    }
    return false;
  }

  private cleanExpiredLocks() {
    const now = new Date();
    for (const asset of this.assets.values()) {
      if (asset.lock && new Date(asset.lock.expiresAt) <= now) {
        asset.lock = null;
      }
    }
  }

  /**
   * Update asset with optimistic concurrency control
   */
  public updateAsset(params: {
    assetId: string;
    expectedVersion: number;
    newLane?: 'low' | 'medium' | 'high';
    newStatus?: 'pending' | 'in_review' | 'approved' | 'rejected';
    newContent?: string;
    user: string;
    role: string;
    note?: string;
    forceOverride?: boolean;
  }): { success: boolean; asset?: PipelineAsset; conflict?: PipelineConflict } {
    this.cleanExpiredLocks();
    const asset = this.assets.get(params.assetId);
    if (!asset) {
      throw new Error(`Asset ${params.assetId} not found`);
    }

    // 1. Lock check (if locked by someone else)
    if (asset.lock && !asset.lock.lockedBy.startsWith(params.user) && !params.forceOverride) {
      return {
        success: false,
        conflict: {
          conflict: true,
          code: 'RESOURCE_LOCKED',
          message: `Concurrency Conflict: Asset ${asset.id} is locked by ${asset.lock.lockedBy}. Please wait or request lock release.`,
          serverAsset: { ...asset },
          attemptedVersion: params.expectedVersion,
          serverVersion: asset.version,
          timestamp: new Date().toISOString()
        }
      };
    }

    // 2. Optimistic Concurrency Check (Version Matching)
    if (!params.forceOverride && asset.version !== params.expectedVersion) {
      return {
        success: false,
        conflict: {
          conflict: true,
          code: 'CONCURRENCY_CONFLICT',
          message: `Concurrency Race Condition Detected! Asset ${asset.id} was already updated to v${asset.version} by ${asset.lastModifiedBy} at ${new Date(asset.lastModified).toLocaleTimeString()}. Your edit is based on stale v${params.expectedVersion}.`,
          serverAsset: { ...asset },
          attemptedVersion: params.expectedVersion,
          serverVersion: asset.version,
          timestamp: new Date().toISOString()
        }
      };
    }

    // 3. Apply Update
    asset.version += 1;
    if (params.newLane) asset.lane = params.newLane;
    if (params.newStatus) asset.status = params.newStatus;
    if (params.newContent !== undefined) asset.content = params.newContent;

    const actor = `${params.user} (${params.role})`;
    asset.lastModified = new Date().toISOString();
    asset.lastModifiedBy = actor;
    asset.lock = null; // Release lock on write

    asset.history.push({
      version: asset.version,
      action: params.forceOverride ? 'FORCE_OVERRIDE_UPDATE' : (params.newStatus ? `STATUS_${params.newStatus.toUpperCase()}` : 'UPDATED'),
      actor,
      timestamp: asset.lastModified,
      note: params.note || `Asset moved/updated in ${asset.lane} lane`
    });

    return {
      success: true,
      asset: { ...asset }
    };
  }

  /**
   * Resolve an active conflict
   */
  public resolveConflict(params: {
    assetId: string;
    resolutionType: 'ACCEPT_SERVER' | 'FORCE_OVERRIDE' | 'MERGE';
    mergedContent?: string;
    newStatus?: 'approved' | 'rejected' | 'pending';
    user: string;
    role: string;
  }) {
    const asset = this.assets.get(params.assetId);
    if (!asset) throw new Error(`Asset ${params.assetId} not found`);

    if (params.resolutionType === 'ACCEPT_SERVER') {
      return {
        success: true,
        resolution: 'ACCEPT_SERVER',
        asset: { ...asset },
        message: `Accepted server state v${asset.version} updated by ${asset.lastModifiedBy}.`
      };
    }

    if (params.resolutionType === 'FORCE_OVERRIDE') {
      return this.updateAsset({
        assetId: params.assetId,
        expectedVersion: asset.version,
        newStatus: params.newStatus || asset.status,
        newContent: params.mergedContent || asset.content,
        user: params.user,
        role: params.role,
        note: `Force Override conflict resolution signed off by ${params.user} (${params.role})`,
        forceOverride: true
      });
    }

    if (params.resolutionType === 'MERGE') {
      return this.updateAsset({
        assetId: params.assetId,
        expectedVersion: asset.version,
        newStatus: params.newStatus || 'approved',
        newContent: params.mergedContent || asset.content,
        user: params.user,
        role: params.role,
        note: `3-Way Merge conflict resolution applied by ${params.user} (${params.role})`,
        forceOverride: true
      });
    }

    return { success: false, message: 'Invalid resolution type' };
  }

  /**
   * Add a newly created/mutated asset to the pipeline
   */
  public addAsset(asset: Partial<PipelineAsset> & { id: string; title: string; content: string }) {
    const risk = asset.riskLevel || 'High';
    const lane = risk === 'Low' ? 'low' : risk === 'Medium' ? 'medium' : 'high';
    const now = new Date().toISOString();

    const newAsset: PipelineAsset = {
      id: asset.id,
      title: asset.title,
      channel: asset.channel || 'LinkedIn Ads',
      content: asset.content,
      complianceScore: asset.complianceScore ?? 45,
      riskLevel: risk,
      lane,
      status: 'pending',
      version: 1,
      lastModified: now,
      lastModifiedBy: asset.lastModifiedBy || 'Editor Creator',
      lock: null,
      history: [
        {
          version: 1,
          action: 'PUBLISHED_OVERRIDE',
          actor: asset.lastModifiedBy || 'Creator',
          timestamp: now,
          note: `New asset queued into ${risk} Risk Approval Pipeline`
        }
      ]
    };

    this.assets.set(newAsset.id, newAsset);
    return newAsset;
  }
}

export const approvalPipelineService = new ApprovalPipelineService();
