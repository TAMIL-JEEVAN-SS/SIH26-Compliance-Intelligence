import { Cable, Database, LockKeyhole, Settings2, SlidersHorizontal } from 'lucide-react';
import { PageFrame, Section } from '@/components/command-ui';

export default function Settings() {
  return <PageFrame eyebrow="Platform / 08" title="System settings" description="Visible operating parameters for the demo environment and its model handoffs."><div className="settings-grid"><Section title="Risk thresholds" caption="Backend riskEngine policy"><div className="settings-list"><Setting label="Critical threshold" value="80 points" tone="critical" /><Setting label="High threshold" value="60 points" tone="high" /><Setting label="Inspection eligibility" value="60+ points" /><Setting label="Confirmed finding delta" value="+13 points" tone="accent" /></div></Section><Section title="Signal weights" caption="Composite score inputs"><div className="weight-list"><Weight label="History pattern" value={25} /><Weight label="Reporting variance" value={30} /><Weight label="Compliance record" value={25} /><Weight label="Alert confidence" value={20} /></div></Section><Section title="Connection modes" caption="Current runtime posture"><div className="mode-list"><div className="mode-card active"><Cable size={16} /><div><strong>API server connected</strong><span>OpenAPI-generated hooks · credentials enabled</span></div><i /></div><div className="mode-card active"><Database size={16} /><div><strong>Mock simulation active</strong><span>Deterministic Saksham flow available for review</span></div><i /></div><div className="mode-card"><LockKeyhole size={16} /><div><strong>Audit logging</strong><span>Read-only preview in demo environment</span></div><i /></div></div></Section><Section title="Model handoff" caption="No client-side overrides"><div className="settings-callout"><SlidersHorizontal size={17} /><div><strong>Server-owned calculations</strong><p>Monitoring discrepancy, risk level, assignment routing, and the +13 confirmed-finding behavior are computed by the backend engines. This surface only submits valid API inputs.</p></div></div></Section></div></PageFrame>;
}

function Setting({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return <div className="setting-row"><span>{label}</span><strong className={tone}>{value}</strong></div>;
}

function Weight({ label, value }: { label: string; value: number }) {
  return <div className="weight-row"><div><span>{label}</span><strong>{value}%</strong></div><div className="weight-track"><span style={{ width: `${value * 4}%` }} /></div></div>;
}