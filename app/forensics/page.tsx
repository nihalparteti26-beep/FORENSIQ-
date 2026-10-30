'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { JudgeDemoBar } from '../../components/JudgeDemoBar';
import { BrandRippleGraph } from '../../components/BrandRippleGraph';

export default function ForensicsPage() {
  const [currentRole, setCurrentRole] = useState<'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance'>('Brand Manager');
  const [privacyShieldActive, setPrivacyShieldActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar currentPath="/forensics" />
      <div className="flex-1 flex flex-col min-w-0">
        <JudgeDemoBar activePage="forensics" />
        <Topbar
          title="Step 4: Impact & Forensics (BrandRipple™)"
          subtitle="Interactive provenance genealogy, blast radius containment & 2-sec cascade simulation"
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          privacyShieldActive={privacyShieldActive}
          onTogglePrivacyShield={() => setPrivacyShieldActive(!privacyShieldActive)}
        />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          <BrandRippleGraph />
        </main>
      </div>
    </div>
  );
}
