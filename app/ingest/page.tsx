'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { JudgeDemoBar } from '../../components/JudgeDemoBar';
import { BrandDNATable } from '../../components/BrandDNATable';

export default function IngestPage() {
  const [currentRole, setCurrentRole] = useState<'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance'>('Brand Manager');
  const [privacyShieldActive, setPrivacyShieldActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar currentPath="/ingest" />
      <div className="flex-1 flex flex-col min-w-0">
        <JudgeDemoBar activePage="ingest" />
        <Topbar
          title="Step 1: Ingest & BrandTwin Bootup"
          subtitle="Parse brand guidelines, extract testable claims into BrandDNA Knowledge Graph & Vector DB"
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          privacyShieldActive={privacyShieldActive}
          onTogglePrivacyShield={() => setPrivacyShieldActive(!privacyShieldActive)}
        />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          <BrandDNATable />
        </main>
      </div>
    </div>
  );
}
