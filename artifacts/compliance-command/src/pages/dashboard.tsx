import { useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ClipboardCheck,
  Crosshair,
  FileWarning,
  MapPin,
  Radar,
  RefreshCw,
  ShieldCheck,
  Target,
} from 'lucide-react';
import {
  getHealthCheckDashboardQueryKey,
  getHealthCheckQueryKey,
  getGetInstituteQueryKey,
  getListInstitutesQueryKey,
  getListInspectionsQueryKey,
  useGenerateInspection,
  useGetInstitute,
  useHealthCheck,
  useHealthCheckDashboard,
  useListInstitutes,
  useListInspections,
  useRunMonitoring,
  type Institute,
  type Inspection,
  type MonitoringResult,
} from '@workspace/api-client-react';
import { Link } from 'wouter';

const iconProps = { size: 15, strokeWidth: 1.8 };

function formatDate(value?: string | null) {
  if (!value) return 'Not yet monitored';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatRelative(value?: string | null) {
  if (!value) return 'No recent run';
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

function riskClass(level?: string) {
  return String(level ?? '').toLowerCase();
}

function StatusBadge({ level }: { level: string }) {
  return <span className={`risk-badge ${riskClass(level)}`} data-testid={`status-risk-${level.toLowerCase()}`}>{level}</span>;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="side-rail" aria-label="Primary navigation">
        <div className="brand-mark">
          <div className="brand-symbol">CI</div>
          <div>
            <div className="brand-title">Civic Signal</div>
            <span className="brand-subtitle">Compliance command</span>
          </div>
        </div>
        <div className="nav-label">Operations</div>
        <nav className="nav-list">
          <Link href="/" className="nav-item active" data-testid="link-dashboard"><Radar {...iconProps} /> Command dashboard</Link>
          <Link href="/inspector" className="nav-item" data-testid="link-inspector"><ClipboardCheck {...iconProps} /> Inspector view</Link>
        </nav>
        <div className="rail-footer">
          <div className="rail-status"><span className="status-dot" /> Systems operational</div>
          <div className="eyebrow" style={{ color: 'hsl(var(--sidebar-foreground) / .38)', marginTop: 10 }}>Region / North district</div>
        </div>
      </aside>
      <main className="main-area">{children}</main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/" className="nav-item active" data-testid="mobile-link-dashboard"><Radar {...iconProps} /> Dashboard</Link>
        <Link href="/inspector" className="nav-item" data-testid="mobile-link-inspector"><ClipboardCheck {...iconProps} /> Inspector</Link>
      </nav>
    </div>
  );
}

function MetricCard({ label, value, note, primary, accent }: { label: string; value: string | number; note: string; primary?: boolean; accent?: boolean }) {
  return (
    <div className={`metric-card ${primary ? 'primary' : ''}`} data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="metric-kicker">{label}</div>
      <div className={`metric-value ${accent ? 'metric-accent' : ''}`}>{value}</div>
      <div className="metric-note">{note}</div>
    </div>
  );
}

function InstituteTable({ institutes, selectedId, onSelect }: { institutes: Institute[]; selectedId?: string; onSelect: (id: string) => void }) {
  if (!institutes.length) return <div className="empty-state" data-testid="empty-institutes">No institutes are currently in the monitoring queue.</div>;
  return (
    <div className="table-wrap">
      <table className="risk-table">
        <thead><tr><th>Institute</th><th>Risk score</th><th>Risk level</th><th>Attendance</th><th>Last signal</th></tr></thead>
        <tbody>
          {institutes.map((institute) => (
            <tr
              key={institute.id}
              className={selectedId === institute.id ? 'selected' : ''}
              onClick={() => onSelect(institute.id)}
              data-testid={`row-institute-${institute.id}`}
            >
              <td>
                <div className="institute-name">{institute.name}</div>
                <div className="institute-location"><MapPin size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />{institute.location}</div>
              </td>
              <td>
                <div className="risk-number">{institute.riskScore.toFixed(1)}</div>
                <div className="risk-bar"><span className={institute.riskScore >= 70 ? 'high' : ''} style={{ width: `${Math.min(100, institute.riskScore)}%` }} /></div>
              </td>
              <td><StatusBadge level={institute.riskLevel} /></td>
              <td><span className="font-mono">{institute.reportedAttendance.toFixed(1)}%</span><div className="institute-location">reported</div></td>
              <td><span className="institute-location">{formatRelative(institute.lastMonitoredAt)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InstituteDetail({ institute, onInspection }: { institute?: Institute; onInspection: () => void }) {
  if (!institute) return <div className="empty-state" data-testid="empty-selected-institute">Select an institute to inspect its signal profile.</div>;
  const signals = [
    ['History pattern', institute.historyRisk],
    ['Reporting variance', institute.reportingRisk],
    ['Compliance record', institute.complianceRisk],
    ['Alert confidence', institute.alertRisk],
  ];
  return (
    <div className="detail-panel" data-testid={`detail-institute-${institute.id}`}>
      <div className="detail-heading">
        <div>
          <h2>{institute.name}</h2>
          <p><MapPin size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{institute.location}</p>
        </div>
        <div className="detail-score">
          <div className="detail-score-value">{institute.riskScore.toFixed(0)}<span>/100</span></div>
          <StatusBadge level={institute.riskLevel} />
        </div>
      </div>
      <div className="signal-grid">
        {signals.map(([label, score]) => (
          <div className="signal" key={label}>
            <div className="signal-label">{label}</div>
            <div className="signal-row"><div className="signal-track"><span style={{ width: `${Math.min(100, Number(score))}%` }} /></div><span className="signal-score">{Number(score).toFixed(0)}</span></div>
          </div>
        ))}
      </div>
      <div className="detail-meta">
        <div><div className="meta-label">Reported attendance</div><div className="meta-value">{institute.reportedAttendance.toFixed(1)}%</div></div>
        <div><div className="meta-label">Observed attendance</div><div className="meta-value">{institute.observedAttendance === null ? 'Awaiting observation' : `${institute.observedAttendance.toFixed(1)}%`}</div></div>
        <div><div className="meta-label">Current status</div><div className="meta-value">{institute.status.replaceAll('_', ' ')}</div></div>
        <div><div className="meta-label">Last monitored</div><div className="meta-value">{formatDate(institute.lastMonitoredAt)}</div></div>
      </div>
      {institute.riskScore >= 60 && <button className="button button-outline button-full" onClick={onInspection} data-testid={`button-generate-inspection-${institute.id}`}><Target {...iconProps} /> Generate surprise inspection</button>}
    </div>
  );
}

function MonitoringPanel({ institute, onCompleted }: { institute?: Institute; onCompleted: (result: MonitoringResult) => void }) {
  const [observed, setObserved] = useState(institute?.observedAttendance?.toString() ?? '');
  const monitoring = useRunMonitoring();
  const canRun = Boolean(institute && observed !== '' && Number(observed) >= 0);
  const run = () => {
    if (!institute || !canRun) return;
    monitoring.mutate({ id: institute.id, data: { observedAttendance: Number(observed) } }, { onSuccess: onCompleted });
  };
  if (!institute) return null;
  return (
    <div className="panel action-panel" data-testid="panel-monitoring">
      <div className="panel-head"><div><div className="section-title">Monitoring action</div><div className="section-caption">Record an observed attendance signal</div></div><Activity {...iconProps} /></div>
      <div style={{ padding: 17 }}>
        <div className="form-row">
          <div className="field"><label htmlFor="observed-attendance">Observed attendance %</label><input id="observed-attendance" className="input" type="number" min="0" step="0.1" value={observed} onChange={(event) => setObserved(event.target.value)} placeholder="e.g. 68.5" data-testid="input-observed-attendance" /></div>
          <button className="button button-amber" onClick={run} disabled={!canRun || monitoring.isPending} data-testid="button-run-monitoring">{monitoring.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Crosshair {...iconProps} />} {monitoring.isPending ? 'Running signal…' : 'Run monitoring'}</button>
        </div>
        {monitoring.isError && <div className="result-callout" data-testid="error-monitoring"><strong>Monitoring could not be completed</strong><span>Check the observed value and retry the signal.</span></div>}
      </div>
    </div>
  );
}

function MonitoringResultCard({ result }: { result: MonitoringResult }) {
  return (
    <div className={`result-callout ${result.anomalyDetected ? '' : 'normal'}`} data-testid="result-monitoring">
      <strong>{result.anomalyDetected ? `Anomaly detected · ${result.anomalySeverity}` : 'No attendance anomaly detected'}</strong>
      <span>{result.institute.name} · {Math.abs(result.discrepancy).toFixed(1)}% discrepancy · risk {result.previousRiskScore.toFixed(0)} → {result.riskScore.toFixed(0)}</span>
    </div>
  );
}

function InspectionPanel({ inspections, isLoading, generated }: { inspections: Inspection[]; isLoading: boolean; generated?: Inspection }) {
  return (
    <div className="panel" data-testid="panel-recent-inspections">
      <div className="panel-head"><div><div className="section-title">Inspection context</div><div className="section-caption">Newest assignments and findings</div></div><FileWarning {...iconProps} /></div>
      {generated && <div className="inspection-generated" data-testid="card-generated-inspection">
        <div className="eyebrow">Surprise inspection generated</div>
        <div className="inspection-generated-title">{generated.institute.name}</div>
        <div className="inspection-generated-grid">
          <div><span>Inspector</span><strong>{generated.inspector}</strong></div>
          <div><span>Reason</span><strong>{generated.reason}</strong></div>
          <div><span>Risk</span><strong>{generated.riskScore.toFixed(0)}</strong></div>
          <div><span>Assignment</span><strong>{generated.assignmentStatus}</strong></div>
        </div>
      </div>}
      {isLoading ? <div className="loading-state"><div className="skeleton skeleton-row" /><div className="skeleton skeleton-row" /></div> : inspections.length === 0 ? <div className="empty-state" data-testid="empty-inspections">No inspection records yet.</div> : (
        <div className="inspection-list">
          {inspections.slice(0, 4).map((inspection) => (
            <div className="inspection-item" key={inspection.id} data-testid={`inspection-${inspection.id}`}>
              <div><div className="inspection-main">{inspection.institute.name}</div><div className="inspection-sub">{inspection.reason} · {inspection.inspector}</div><div style={{ marginTop: 7 }}><span className={`risk-badge ${inspection.assignmentStatus === 'SUBMITTED' ? 'low' : 'medium'}`}>{inspection.assignmentStatus}</span></div></div>
              <div className="inspection-date">{formatDate(inspection.timestamp)}<br /><span style={{ color: 'hsl(var(--foreground))' }}>risk {inspection.riskScore.toFixed(0)}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const health = useHealthCheckDashboard({ query: { queryKey: getHealthCheckDashboardQueryKey() } });
  const systemHealth = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const institutesQuery = useListInstitutes();
  const inspectionsQuery = useListInspections();
  const [selectedId, setSelectedId] = useState<string>();
  const [monitoringResult, setMonitoringResult] = useState<MonitoringResult>();
  const [generatedInspection, setGeneratedInspection] = useState<Inspection>();
  const institutes = institutesQuery.data ?? [];
  const inspections = inspectionsQuery.data ?? [];
  const activeId = selectedId ?? institutes.find((item) => item.id === 'saksham-rehabilitation-centre')?.id ?? institutes[0]?.id;
  const selected = institutes.find((item) => item.id === activeId);
  const detailQuery = useGetInstitute(activeId ?? '', { query: { enabled: Boolean(activeId), queryKey: getGetInstituteQueryKey(activeId ?? '') } });
  const detail = detailQuery.data ?? selected;
  const generateInspection = useGenerateInspection();
  const stats = useMemo(() => ({
    critical: institutes.filter((item) => item.riskLevel === 'CRITICAL').length,
    high: institutes.filter((item) => item.riskLevel === 'HIGH').length,
    medium: institutes.filter((item) => item.riskLevel === 'MEDIUM').length,
    low: institutes.filter((item) => item.riskLevel === 'LOW').length,
  }), [institutes]);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: getListInstitutesQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getListInspectionsQueryKey() });
  };
  const handleMonitoring = (result: MonitoringResult) => {
    setMonitoringResult(result);
    refresh();
    void queryClient.invalidateQueries({ queryKey: getGetInstituteQueryKey(result.institute.id) });
  };
  const handleGenerate = () => {
    if (!activeId) return;
    setGeneratedInspection(undefined);
    generateInspection.mutate({ data: { instituteId: activeId } }, {
      onSuccess: (inspection) => {
        setGeneratedInspection(inspection);
        refresh();
        void queryClient.invalidateQueries({ queryKey: getGetInstituteQueryKey(activeId) });
      },
    });
  };
  const healthLabel = health.data?.status ?? systemHealth.data?.status ?? (health.isError || systemHealth.isError ? 'degraded' : 'checking');

  return (
    <Shell>
      <header className="topbar">
        <div><div className="eyebrow">North district / programs</div><div className="topbar-title">Compliance Intelligence Command</div></div>
        <div className="topbar-meta"><div className="live-chip"><span className="status-dot" /> {healthLabel}</div><div className="operator"><div className="operator-avatar">MO</div><div><div className="operator-name">M. Okafor</div><div className="operator-role">Program officer</div></div></div></div>
      </header>
      <div className="page-wrap">
        <div className="page-heading animate-enter">
          <div><div className="eyebrow">Operational overview / 01</div><h1>See the signal. Make the call.</h1><p>Prioritized oversight across attendance and compliance programs.</p></div>
          <div className="date-stamp"><strong>{new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</strong>Last refreshed {formatRelative(new Date().toISOString())}</div>
        </div>
        {institutesQuery.isError ? <div className="error-state panel" data-testid="error-institutes"><AlertTriangle size={20} /><p>Institute signals are unavailable.</p><button className="button button-outline" onClick={() => void institutesQuery.refetch()} data-testid="button-retry-institutes">Retry connection</button></div> : (
          <>
            <div className="metric-grid animate-enter">
              <MetricCard label="Critical" value={stats.critical} note="Immediate escalation" primary />
              <MetricCard label="High" value={stats.high} note="Inspection eligible" accent />
              <MetricCard label="Medium" value={stats.medium} note="Continue monitoring" />
              <MetricCard label="Low" value={stats.low} note="Within normal range" />
            </div>
            <div className="content-grid">
              <div className="detail-stack">
                <section className="panel animate-enter" style={{ animationDelay: '.05s' }}>
                  <div className="panel-head"><div><div className="section-title">Prioritized institutes</div><div className="section-caption">Sorted by composite risk score</div></div><span className="eyebrow">{institutes.length} records</span></div>
                  {institutesQuery.isLoading ? <div className="loading-state"><div className="skeleton skeleton-row" /><div className="skeleton skeleton-row" /><div className="skeleton skeleton-row" /></div> : <InstituteTable institutes={institutes} selectedId={activeId} onSelect={(id) => { setSelectedId(id); setMonitoringResult(undefined); }} />}
                </section>
                <section className="panel animate-enter" style={{ animationDelay: '.1s' }}>
                  <div className="panel-head"><div><div className="section-title">Selected institute signal profile</div><div className="section-caption">Traceable drivers behind the current score</div></div><ShieldCheck {...iconProps} /></div>
                  <InstituteDetail institute={detail} onInspection={handleGenerate} />
                  {generateInspection.isError && <div className="result-callout" style={{ margin: '0 17px 17px' }} data-testid="error-generate-inspection"><strong>Inspection could not be generated</strong><span>There may be no eligible inspector. Retry when ready.</span></div>}
                </section>
              </div>
              <div className="detail-stack">
                <MonitoringPanel key={detail?.id ?? 'no-selection'} institute={detail} onCompleted={handleMonitoring} />
                {monitoringResult && <MonitoringResultCard result={monitoringResult} />}
                <InspectionPanel inspections={inspections} isLoading={inspectionsQuery.isLoading} generated={generatedInspection} />
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}