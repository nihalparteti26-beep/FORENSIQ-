'use client';

import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { JudgeDemoBar } from '../components/JudgeDemoBar';
import { TipTapEditor } from '../components/TipTapEditor';

export default function HomePage() {
  const [currentRole, setCurrentRole] = useState<'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance'>('Creator');
  const [privacyShieldActive, setPrivacyShieldActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar currentPath="/editor" />
      <div className="flex-1 flex flex-col min-w-0">
        <JudgeDemoBar activePage="editor" />
        <Topbar
          title="Creation-Time Firewall (Real-Time Editor)"
          subtitle="Real-time AST token linting: Red (unsupported claims), Yellow (tone drift), Orange (expired facts)"
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          privacyShieldActive={privacyShieldActive}
          onTogglePrivacyShield={() => setPrivacyShieldActive(!privacyShieldActive)}
        />
        <main className="flex-1 overflow-y-auto">
          <TipTapEditor />
        </main>
      </div>
    </div>
  );
}
