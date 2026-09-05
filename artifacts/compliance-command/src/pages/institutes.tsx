import { useMemo, useState } from 'react';
import { ArrowUpDown, MapPin, Search } from 'lucide-react';
import { Link } from 'wouter';
import { useListInstitutes, type Institute } from '@workspace/api-client-react';
import { ErrorState, LoadingRows, MetricTile, PageFrame, Section, StatusBadge } from '@/components/command-ui';

export default function Institutes() {
  const query = useListInstitutes();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('ALL');
  const [sort, setSort] = useState<'risk' | 'name'>('risk');
  const institutes = query.data ?? [];
  const filtered = useMemo(() => institutes.filter((item) => `${item.name} ${item.location}`.toLowerCase().includes(search.toLowerCase()) && (level === 'ALL' || item.riskLevel === level)).sort((a, b) => sort === 'risk' ? b.riskScore - a.riskScore : a.name.localeCompare(b.name)), [institutes, level, search, sort]);
  const critical = institutes.filter((item) => item.riskLevel === 'CRITICAL').length;
  return <PageFrame eyebrow="Registry / 02" title="Institutes" description="Every monitored program, ranked by the signal that needs attention." actions={<Link href="/monitoring" className="button button-amber" data-testid="link-open-monitoring">Open monitoring console</Link>}>
    <div className="metric-grid compact-grid"><MetricTile label="Tracked" value={institutes.length} note="Connected institutes" /><MetricTile label="Critical" value={critical} note="Immediate review" tone="primary" /><MetricTile label="Observed" value={institutes.filter((item) => item.observedAttendance !== null).length} note="Have a signal" /></div>
    <Section title="Institute registry" caption={`${filtered.length} matching records`}>
      <div className="toolbar"><div className="search-field"><Search size={15} /><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search institute or location" data-testid="input-institute-search" /></div><select className="input select-input" value={level} onChange={(event) => setLevel(event.target.value)} data-testid="select-risk-filter"><option value="ALL">All risk levels</option><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select><button className="button button-outline" onClick={() => setSort(sort === 'risk' ? 'name' : 'risk')} data-testid="button-sort-institutes"><ArrowUpDown size={14} /> Sort: {sort === 'risk' ? 'risk' : 'name'}</button></div>
       {query.isLoading ? <LoadingRows /> : query.isError ? <ErrorState message="Institute registry is unavailable." onRetry={() => void query.refetch()} /> : filtered.length === 0 ? <div className="empty-state" data-testid="state-empty-institutes">No institute records match this filter.</div> : <div className="table-wrap"><table className="risk-table institute-registry-table"><thead><tr><th>Institute</th><th>Reported</th><th>Observed</th><th>Discrepancy</th><th>Risk</th><th>Risk level</th><th>Status</th><th>Last monitoring</th><th>Action</th></tr></thead><tbody>{filtered.map((institute) => <InstituteRow key={institute.id} institute={institute} />)}</tbody></table></div>}
    </Section>
  </PageFrame>;
}

function InstituteRow({ institute }: { institute: Institute }) {
  const discrepancy = institute.observedAttendance === null || institute.reportedAttendance <= 0
    ? null
    : Math.abs(institute.reportedAttendance - institute.observedAttendance) / institute.reportedAttendance * 100;
  const lastMonitoring = institute.lastMonitoredAt
    ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(institute.lastMonitoredAt))
    : 'Not yet';
  return <tr data-testid={`row-registry-${institute.id}`}>
    <td><Link className="table-link" href={`/institutes/${institute.id}`} data-testid={`link-institute-${institute.id}`}><strong>{institute.name}</strong><span><MapPin size={10} /> {institute.location}</span></Link></td>
    <td><strong className="font-mono">{institute.reportedAttendance.toFixed(1)}%</strong></td>
    <td className="font-mono">{institute.observedAttendance === null ? '—' : `${institute.observedAttendance.toFixed(1)}%`}</td>
    <td className="font-mono">{discrepancy === null ? '—' : `${discrepancy.toFixed(1)}%`}</td>
    <td><strong className="font-mono">{institute.riskScore.toFixed(1)}</strong><div className="risk-bar"><span className={institute.riskScore >= 70 ? 'high' : ''} style={{ width: `${Math.min(100, institute.riskScore)}%` }} /></div></td>
    <td><StatusBadge level={institute.riskLevel} /></td>
    <td><StatusBadge level={institute.status} /></td>
    <td className="font-mono">{lastMonitoring}</td>
    <td><Link href={`/institutes/${institute.id}`} className="button button-outline table-button" data-testid={`button-open-institute-${institute.id}`}>View</Link></td>
  </tr>;
}