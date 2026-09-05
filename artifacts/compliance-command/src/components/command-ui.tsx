import { AlertTriangle, RefreshCw } from 'lucide-react';
import { type ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';

export function PageFrame({ eyebrow, title, description, children, actions }: { eyebrow: string; title: string; description: string; children: ReactNode; actions?: ReactNode }) {
  return <AppShell><header className="topbar"><div><div className="eyebrow">North district / programs</div><div className="topbar-title">Compliance Intelligence Command</div></div><div className="topbar-meta"><div className="demo-pill">DEMO MODE</div><div className="operator"><div className="operator-avatar">MO</div><div><div className="operator-name">M. Okafor</div><div className="operator-role">Program officer</div></div></div></div></header><div className="page-wrap"><div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>{children}</div></AppShell>;
}

export function Section({ title, caption, children, action }: { title: string; caption?: string; children: ReactNode; action?: ReactNode }) {
  return <section className="panel"><div className="panel-head"><div><div className="section-title">{title}</div>{caption && <div className="section-caption">{caption}</div>}</div>{action}</div>{children}</section>;
}

export function StatusBadge({ level }: { level: string }) {
  return <span className={`risk-badge ${level.toLowerCase()}`} data-testid={`status-${level.toLowerCase()}`}>{level.replaceAll('_', ' ')}</span>;
}

export function LoadingRows({ count = 3 }: { count?: number }) {
  return <div className="loading-state" data-testid="state-loading">{Array.from({ length: count }, (_, index) => <div className="skeleton skeleton-row" key={index} />)}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="error-state" data-testid="state-error"><AlertTriangle size={20} /><p>{message}</p><button className="button button-outline" onClick={onRetry} data-testid="button-retry"><RefreshCw size={14} /> Retry connection</button></div>;
}

export function MetricTile({ label, value, note, tone = '' }: { label: string; value: string | number; note: string; tone?: string }) {
  return <div className={`metric-card ${tone}`} data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="metric-kicker">{label}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></div>;
}