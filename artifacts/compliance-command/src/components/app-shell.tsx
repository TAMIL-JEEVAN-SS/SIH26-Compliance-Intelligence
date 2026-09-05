import { type ReactNode } from 'react';
import { Activity, BarChart3, Building2, ClipboardCheck, Files, ListChecks, Radar, Settings2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const navigation = [
  { href: '/', label: 'Command Centre', icon: Radar, testId: 'link-command-centre' },
  { href: '/institutes', label: 'Institutes', icon: Building2, testId: 'link-institutes' },
  { href: '/monitoring', label: 'Monitoring', icon: Activity, testId: 'link-monitoring' },
  { href: '/inspections', label: 'Inspection Queue', icon: ListChecks, testId: 'link-inspections' },
  { href: '/inspector', label: 'Inspector Field App', icon: ClipboardCheck, testId: 'link-inspector-field' },
  { href: '/analytics', label: 'Risk Analytics', icon: BarChart3, testId: 'link-analytics' },
  { href: '/evidence', label: 'Evidence & Reports', icon: Files, testId: 'link-evidence' },
  { href: '/settings', label: 'System Settings', icon: Settings2, testId: 'link-settings' },
];

export function AppShell({ children, inspector = false }: { children: ReactNode; inspector?: boolean }) {
  const [location] = useLocation();
  return (
    <div className={`app-shell ${inspector ? 'app-shell-inspector' : ''}`}>
      <aside className="side-rail" aria-label="Primary navigation">
        <Link href="/" className="brand-mark" data-testid="link-brand">
          <div className="brand-symbol">CI</div>
          <div>
            <div className="brand-title">Civic Signal</div>
            <span className="brand-subtitle">Compliance command</span>
          </div>
        </Link>
        <div className="demo-mode"><span className="status-dot" /> DEMO MODE / MOCK-SIMULATION</div>
        <div className="nav-label">Operations</div>
        <nav className="nav-list">
          {navigation.map(({ href, label, icon: Icon, testId }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`} data-testid={testId}><Icon size={15} strokeWidth={1.8} /><span>{label}</span></Link>;
          })}
        </nav>
        <div className="rail-footer">
          <div className="rail-status"><span className="status-dot" /> Systems operational</div>
          <div className="eyebrow rail-region">Region / North district</div>
        </div>
      </aside>
      <main className="main-area">{children}</main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 5).map(({ href, label, icon: Icon, testId }) => {
          const active = href === '/' ? location === '/' : location.startsWith(href);
          return <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`} data-testid={`mobile-${testId}`}><Icon size={15} /><span>{label.replace('Command Centre', 'Command')}</span></Link>;
        })}
      </nav>
    </div>
  );
}