import { useState, useEffect } from 'react';
import AgentStatusCard from '../components/AgentStatusCard';
import { fetchExperimentResults } from '../lib/api';
import { AGENT_CONFIG } from '../lib/types';
import type { ExperimentResult, AgentId } from '../lib/types';
import { LayoutTemplate, Server, TestTube, FileText, PenTool, AlertTriangle, Check, X } from 'lucide-react';

const AGENT_IDS: AgentId[] = ['frontend', 'backend', 'testing', 'documentation', 'api-design'];

const AGENT_ICONS: Record<AgentId, React.ReactNode> = {
  'frontend': <LayoutTemplate size={18} />,
  'backend': <Server size={18} />,
  'testing': <TestTube size={18} />,
  'documentation': <FileText size={18} />,
  'api-design': <PenTool size={18} />,
};

export default function AgentMonitor() {
  const [data, setData] = useState<ExperimentResult | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('frontend');

  useEffect(() => {
    fetchExperimentResults().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-state-title">Loading agent data...</div>
        </div>
      </div>
    );
  }

  const agentArtifacts = data.artifacts.filter(a => a.agentId === selectedAgent);
  const nonCompliant = agentArtifacts.filter(a => !a.isCompliant);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Agent Monitor</h1>
        <p className="page-description">
          Inspect each agent's generated artifacts and compare them against the contract specifications.
        </p>
      </div>

      <div className="agents-grid stagger">
        {AGENT_IDS.map(id => (
          <div key={id} onClick={() => setSelectedAgent(id)} style={{ cursor: 'pointer' }}>
            <AgentStatusCard agentId={id} artifacts={data.artifacts} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`agent-avatar ${selectedAgent}`} style={{ width: 28, height: 28 }}>
            {AGENT_ICONS[selectedAgent]}
          </span>
          {AGENT_CONFIG[selectedAgent].name} — Generated Artifacts
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
          {agentArtifacts.length} artifacts generated, {nonCompliant.length} with contract violations
        </p>
      </div>

      {nonCompliant.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--status-error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Non-Compliant Artifacts (Diff View)
          </h3>
          {nonCompliant.map((artifact, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="violation-tag endpoint" style={{ fontSize: '0.75rem' }}>{artifact.endpoint}</span>
                <span style={{ color: 'var(--text-muted)' }}>on</span>
                <span className="violation-tag service" style={{ fontSize: '0.75rem' }}>{artifact.service}</span>
              </div>
              <div className="diff-container">
                <div className="diff-panel expected">
                  <div className="diff-panel-header" style={{ color: 'var(--text-primary)' }}><Check size={16} /> Expected (Contract)</div>
                  <div className="diff-content">
                    {JSON.stringify(artifact.expectedPayload, null, 2)}
                  </div>
                </div>
                <div className="diff-panel actual">
                  <div className="diff-panel-header" style={{ color: 'var(--status-error)' }}><X size={16} /> Agent Generated</div>
                  <div className="diff-content">
                    {JSON.stringify(artifact.generatedPayload, null, 2)}
                  </div>
                </div>
              </div>
              {artifact.violations.map((v, vi) => (
                <div key={vi} className="violation-item" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', border: '1px solid var(--border-primary)' }}>
                  <div className={`violation-severity ${v.severity}`} />
                  <div className="violation-content">
                    <div className="violation-message">{v.message}</div>
                    <div className="violation-meta">
                      <span className="violation-tag type">{v.type.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        expected: {v.expected} → actual: {v.actual}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {agentArtifacts.filter(a => a.isCompliant).length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={18} /> Compliant Artifacts
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
            {agentArtifacts.filter(a => a.isCompliant).map((artifact, i) => (
              <div key={i} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="violation-tag endpoint" style={{ fontSize: '0.75rem' }}>{artifact.endpoint}</span>
                  <span className="violation-tag service" style={{ fontSize: '0.75rem' }}>{artifact.service}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={14} /> Compliant</span>
                </div>
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {JSON.stringify(artifact.generatedPayload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
