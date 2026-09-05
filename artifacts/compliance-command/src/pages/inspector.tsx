import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Camera,
  Check,
  ClipboardCheck,
  Compass,
  FileText,
  LocateFixed,
  MapPin,
  RefreshCw,
  Send,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { Link } from 'wouter';
import {
  getListInstitutesQueryKey,
  getListInspectionsQueryKey,
  useListInspections,
  useSubmitInspection,
} from '@workspace/api-client-react';

function displayDate(value?: string | null) {
  if (!value) return 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

export default function Inspector() {
  const queryClient = useQueryClient();
  const inspectionsQuery = useListInspections();
  const submit = useSubmitInspection();
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [evidence, setEvidence] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>();
  const [geoState, setGeoState] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const assigned = useMemo(() => (inspectionsQuery.data ?? []).find((item) => item.assignmentStatus === 'ASSIGNED'), [inspectionsQuery.data]);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGeoState('error');
      return;
    }
    setGeoState('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGeoState('success');
      },
      () => setGeoState('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const submitInspection = () => {
    if (!assigned || confirmed === null) return;
    const data: { confirmed: boolean; notes?: string; latitude?: number; longitude?: number; evidence?: string } = { confirmed };
    if (notes.trim()) data.notes = notes.trim();
    if (evidence.trim()) data.evidence = evidence.trim();
    if (coordinates) {
      data.latitude = coordinates.latitude;
      data.longitude = coordinates.longitude;
    }
    submit.mutate({ id: assigned.id, data }, {
      onSuccess: (result) => {
        setSubmitted(true);
        setSubmitMessage(result.escalationRequired ? 'The finding was submitted and escalated for program review.' : 'The finding was submitted to the command dashboard.');
        void queryClient.invalidateQueries({ queryKey: getListInspectionsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getListInstitutesQueryKey() });
      },
    });
  };

  if (submitted) {
    return (
      <div className="inspector-page">
        <header className="inspector-header"><div className="inspector-header-inner"><div className="inspector-topline"><Link href="/" className="mobile-only-back" data-testid="link-return-dashboard"><ArrowLeft size={13} /> Civic Signal</Link><span>Field submission</span></div><h1 className="inspector-title">Record received.</h1><p className="inspector-subtitle">Your inspection finding is now part of the compliance record.</p></div></header>
        <main className="inspector-body">
          <section className="inspector-card success-card" data-testid="success-inspection-submission"><div className="success-seal"><Check size={23} /></div><h2>Inspection submitted</h2><p>{submitMessage}</p><Link href="/" className="button button-primary" data-testid="link-view-command"><ClipboardCheck size={14} /> View command dashboard</Link></section>
        </main>
      </div>
    );
  }

  if (inspectionsQuery.isLoading) {
    return <div className="inspector-page"><header className="inspector-header"><div className="inspector-header-inner"><div className="inspector-topline">Civic Signal <span>Field view</span></div><h1 className="inspector-title">Loading assignment.</h1></div></header><main className="inspector-body"><div className="inspector-card"><div className="skeleton" style={{ height: 18, width: '48%' }} /><div className="skeleton" style={{ height: 14, width: '75%', marginTop: 14 }} /><div className="skeleton" style={{ height: 100, marginTop: 22 }} /></div></main></div>;
  }

  if (inspectionsQuery.isError) {
    return <div className="inspector-page"><header className="inspector-header"><div className="inspector-header-inner"><div className="inspector-topline">Civic Signal <span>Field view</span></div><h1 className="inspector-title">Connection interrupted.</h1><p className="inspector-subtitle">The assignment list could not be loaded.</p></div></header><main className="inspector-body"><div className="inspector-card error-state"><ShieldAlert size={22} /><p>Reconnect to retrieve the latest assignment.</p><button className="button button-outline" onClick={() => void inspectionsQuery.refetch()} data-testid="button-retry-inspections"><RefreshCw size={14} /> Retry</button></div></main></div>;
  }

  if (!assigned) {
    return <div className="inspector-page"><header className="inspector-header"><div className="inspector-header-inner"><div className="inspector-topline"><Link href="/" className="mobile-only-back" data-testid="link-return-dashboard-empty"><ArrowLeft size={13} /> Civic Signal</Link><span>Field view</span></div><h1 className="inspector-title">No assignment yet.</h1><p className="inspector-subtitle">The queue is clear. Check back when a new inspection is assigned.</p></div></header><main className="inspector-body"><div className="inspector-card empty-state"><ClipboardCheck size={24} /><p>There are no open inspections assigned to this field view.</p><Link href="/" className="button button-outline" data-testid="link-back-empty"><ArrowLeft size={14} /> Return to command</Link></div></main></div>;
  }

  return (
    <div className="inspector-page">
      <header className="inspector-header">
        <div className="inspector-header-inner">
          <div className="inspector-topline"><Link href="/" className="mobile-only-back" data-testid="link-return-dashboard-inspector"><ArrowLeft size={13} /> Civic Signal</Link><span>DEMO MODE / MOCK-SIMULATION · Assigned inspection · {assigned.id}</span></div>
          <h1 className="inspector-title">Verify the signal.</h1>
          <p className="inspector-subtitle">Capture what happened on the ground. Every field is part of the record.</p>
        </div>
      </header>
      <main className="inspector-body">
        <section className="inspector-card" data-testid="card-assignment">
          <div className="inspector-card-title"><ClipboardCheck size={16} /> Assignment details</div>
          <div className="assignment-grid">
            <div><div className="meta-label">Institute</div><div className="meta-value">{assigned.institute.name}</div></div>
            <div><div className="meta-label">Risk score</div><div className="meta-value"><span className={`risk-badge ${assigned.institute.riskLevel.toLowerCase()}`}>{assigned.riskScore.toFixed(1)} · {assigned.institute.riskLevel}</span></div></div>
            <div><div className="meta-label">Location</div><div className="meta-value"><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{assigned.institute.location}</div></div>
            <div><div className="meta-label">Assigned inspector</div><div className="meta-value"><UserRound size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{assigned.inspector}</div></div>
          </div>
          <div style={{ marginTop: 17, paddingTop: 14, borderTop: '1px solid hsl(var(--border))' }}><div className="meta-label">Reason for visit</div><div className="meta-value">{assigned.reason}</div><div className="inspection-sub">Issued {displayDate(assigned.timestamp)}</div></div>
        </section>

        <section className="inspector-card" data-testid="card-gps">
          <div className="inspector-card-title"><LocateFixed size={16} /> Verify GPS location</div>
          <div className="geo-box">
            <div className="geo-readout">
              {geoState === 'success' && coordinates ? <><strong>Location captured</strong>Lat {coordinates.latitude.toFixed(6)}<br />Long {coordinates.longitude.toFixed(6)}</> : geoState === 'error' ? <><strong>Location unavailable</strong>Allow browser location access and retry.</> : <><strong>Not captured</strong>Capture coordinates at the institute.</>}
            </div>
            <button className="button button-outline" onClick={captureLocation} disabled={geoState === 'locating'} data-testid="button-capture-gps">{geoState === 'locating' ? <RefreshCw size={14} className="animate-spin" /> : <Compass size={14} />} {geoState === 'locating' ? 'Locating…' : geoState === 'success' ? 'Recapture' : 'Capture GPS'}</button>
          </div>
        </section>

        <section className="inspector-card" data-testid="card-evidence">
          <div className="inspector-card-title"><Camera size={16} /> Take / upload evidence</div>
          <div className="field"><label htmlFor="evidence-reference">Photo evidence</label><input id="evidence-reference" className="input" type="file" accept="image/*" capture="environment" onChange={(event) => setEvidence(event.target.files?.[0]?.name ?? '')} data-testid="input-evidence-reference" /></div>
          <div className="inspection-sub" style={{ marginTop: 9 }}><FileText size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{evidence ? `Selected: ${evidence}` : 'The MVP stores the evidence filename in the inspection record.'}</div>
        </section>

        <section className="inspector-card" data-testid="card-finding">
          <div className="inspector-card-title"><ShieldAlert size={16} /> Attendance anomaly</div>
          <div className="confirm-options">
            <div className="confirm-option"><input id="confirmed-yes" type="radio" name="confirmed" checked={confirmed === true} onChange={() => setConfirmed(true)} data-testid="radio-anomaly-confirmed" /><label htmlFor="confirmed-yes">Anomaly confirmed</label></div>
            <div className="confirm-option"><input id="confirmed-no" type="radio" name="confirmed" checked={confirmed === false} onChange={() => setConfirmed(false)} data-testid="radio-anomaly-not-confirmed" /><label htmlFor="confirmed-no">Not confirmed</label></div>
          </div>
          <div className="field" style={{ marginTop: 16 }}><label htmlFor="inspection-notes">Field notes</label><textarea id="inspection-notes" className="textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What did you observe? Note relevant attendance, records, and context." data-testid="textarea-inspection-notes" /></div>
        </section>

        <div className="submit-banner">
          <div><strong>Ready to submit?</strong><p>GPS and finding status will be attached to this inspection.</p></div>
          <button className="button button-primary" onClick={submitInspection} disabled={confirmed === null || submit.isPending} data-testid="button-submit-inspection">{submit.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} {submit.isPending ? 'Submitting…' : 'Submit inspection'}</button>
        </div>
        {submit.isError && <div className="result-callout" data-testid="error-submit-inspection"><strong>Submission failed</strong><span>Keep this page open and retry when the connection is restored.</span></div>}
      </main>
    </div>
  );
}