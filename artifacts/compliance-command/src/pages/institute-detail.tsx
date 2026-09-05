import { ArrowLeft, Target } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useGetInstitute, getGetInstituteQueryKey, useGenerateInspection, getListInspectionsQueryKey, getListInstitutesQueryKey, useListInspections, type Institute } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorState, LoadingRows, PageFrame, Section, StatusBadge } from '@/components/command-ui';

export default function InstituteDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const query = useGetInstitute(id, { query: { enabled: Boolean(id), queryKey: getGetInstituteQueryKey(id) } });
  const generate = useGenerateInspection();
  const inspectionsQuery = useListInspections();
  const client = useQueryClient();
  const institute = query.data;
  const requestInspection = () => {
    if (!id) return;
    generate.mutate({ data: { instituteId: id } }, { onSuccess: () => { void client.invalidateQueries({ queryKey: getListInspectionsQueryKey() }); void client.invalidateQueries({ queryKey: getListInstitutesQueryKey() }); } });
  };
  return <PageFrame eyebrow="Registry / Institute profile" title={institute?.name ?? 'Institute profile'} description={institute ? `${institute.location} · live risk profile` : 'Loading the selected institute.'} actions={<Link href="/institutes" className="button button-outline" data-testid="link-back-institutes"><ArrowLeft size={14} /> All institutes</Link>}>
    {query.isLoading ? <Section title="Loading profile"><LoadingRows count={4} /></Section> : query.isError || !institute ? <Section title="Profile unavailable"><ErrorState message="This institute profile could not be loaded." onRetry={() => void query.refetch()} /></Section> : <DetailContent institute={institute} inspections={(inspectionsQuery.data ?? []).filter((item) => item.institute.id === institute.id)} onGenerate={requestInspection} pending={generate.isPending} error={generate.isError} />}
  </PageFrame>;
}

function DetailContent({ institute, inspections, onGenerate, pending, error }: { institute: Institute; inspections: Array<{ id: string; assignmentStatus: string; timestamp: string; confirmed: boolean | null; riskScore: number }>; onGenerate: () => void; pending: boolean; error: boolean }) {
  const signals = [['History pattern', institute.historyRisk], ['Reporting variance', institute.reportingRisk], ['Compliance record', institute.complianceRisk], ['Alert confidence', institute.alertRisk]];
  const timeline = [
    { label: 'Attendance anomaly detected', detail: institute.observedAttendance === null ? 'Awaiting monitoring signal' : `${Math.abs(institute.reportedAttendance - institute.observedAttendance).toFixed(1)} attendance-point gap observed`, state: institute.observedAttendance === null ? 'pending' : 'complete' },
    { label: 'Risk calculated', detail: `${institute.riskScore.toFixed(0)} / 100 · ${institute.riskLevel}`, state: 'complete' },
    ...inspections.flatMap((inspection) => [
      { label: 'Inspection generated', detail: `${inspection.id} · ${inspection.riskScore.toFixed(0)} risk`, state: 'complete' },
      { label: inspection.confirmed === null ? 'Inspector assignment open' : 'Finding submitted', detail: `${inspection.assignmentStatus} · ${new Date(inspection.timestamp).toLocaleString('en-GB')}`, state: inspection.confirmed === null ? 'pending' : 'complete' },
      ...(inspection.confirmed === true ? [{ label: 'Risk escalated', detail: 'Confirmed anomaly requires program review', state: 'alert' }] : []),
    ]),
  ];
  return <div className="detail-layout"><Section title="Current signal profile" caption="Traceable drivers behind the composite score"><div className="profile-hero"><div><div className="eyebrow">Composite risk</div><div className="profile-score">{institute.riskScore.toFixed(1)}<span>/100</span></div></div><StatusBadge level={institute.riskLevel} /></div><div className="signal-grid">{signals.map(([label, score]) => <div className="signal" key={String(label)}><div className="signal-label">{label}</div><div className="signal-row"><div className="signal-track"><span style={{ width: `${Math.min(100, Number(score))}%` }} /></div><span className="signal-score">{Number(score).toFixed(0)}</span></div></div>)}</div><div className="detail-meta"><div><div className="meta-label">Reported attendance</div><div className="meta-value">{institute.reportedAttendance.toFixed(1)}%</div></div><div><div className="meta-label">Observed attendance</div><div className="meta-value">{institute.observedAttendance === null ? 'Awaiting observation' : `${institute.observedAttendance.toFixed(1)}%`}</div></div><div><div className="meta-label">Current status</div><div className="meta-value">{institute.status.replaceAll('_', ' ')}</div></div><div><div className="meta-label">Last monitored</div><div className="meta-value">{institute.lastMonitoredAt ? new Date(institute.lastMonitoredAt).toLocaleString('en-GB') : 'Not yet monitored'}</div></div></div></Section><Section title="Risk event timeline" caption="Monitoring and inspection history"><div className="event-timeline">{timeline.map((event, index) => <div className={`event-row ${event.state}`} key={`${event.label}-${index}`} data-testid={`timeline-event-${index}`}><span className="event-dot" /><div><strong>{event.label}</strong><p>{event.detail}</p></div></div>)}</div></Section><Section title="Recommended action" caption="Use the backend inspection engine to create an assignment"><div className="action-copy"><Target size={18} /><div><strong>{institute.riskScore >= 60 ? 'Surprise inspection eligible' : 'Continue routine monitoring'}</strong><p>{institute.riskScore >= 60 ? 'This signal is above the inspection threshold. Assignment will be generated by the inspection engine.' : 'No inspection action is required at the current score.'}</p></div></div><button className="button button-amber button-full" disabled={institute.riskScore < 60 || pending} onClick={onGenerate} data-testid="button-generate-detail-inspection"><Target size={14} /> {pending ? 'Generating assignment…' : 'Generate surprise inspection'}</button>{error && <div className="result-callout" data-testid="error-detail-inspection"><strong>Assignment was not generated</strong><span>Retry when an eligible inspector is available.</span></div>}</Section></div>;
}