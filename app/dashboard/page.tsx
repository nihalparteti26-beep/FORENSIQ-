'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { JudgeDemoBar } from '../../components/JudgeDemoBar';
import { BrandDriftRadar } from '../../components/BrandDriftRadar';
import { ApprovalPipeline } from '../../components/ApprovalPipeline';

export default function DashboardPage() {
  const [currentRole, setCurrentRole] = useState<'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance'>('Legal & Compliance');
  const [privacyShieldActive, setPrivacyShieldActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar currentPath="/dashboard" />
      <div className="flex-1 flex flex-col min-w-0">
        <JudgeDemoBar activePage="dashboard" />
        <Topbar
          title="Step 5: Approval & Immunity (Audit & Insights)"
          subtitle="Risk-based routing, BrandContract™ issuance, 40-ad Drift Radar & Root-Cause Immunizer"
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          privacyShieldActive={privacyShieldActive}
          onTogglePrivacyShield={() => setPrivacyShieldActive(!privacyShieldActive)}
        />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto space-y-8">
          {/* Multi-User Real-Time Approval Pipeline */}
          <ApprovalPipeline currentRole={currentRole} />

          <BrandDriftRadar />
        </main>
      </div>
    </div>
  );
}
