import { AGENT_CONFIG } from '../lib/types';
import type { AgentArtifact, AgentId } from '../lib/types';
import { LayoutTemplate, Server, TestTube, FileText, PenTool } from 'lucide-react';

interface AgentStatusCardProps {
  agentId: AgentId;
  artifacts: AgentArtifact[];
}

const AGENT_ICONS: Record<AgentId, React.ReactNode> = {
  'frontend': <LayoutTemplate size={24} />,
  'backend': <Server size={24} />,
  'testing': <TestTube size={24} />,
  'documentation': <FileText size={24} />,
  'api-design': <PenTool size={24} />,
};

export default function AgentStatusCard({ agentId, artifacts }: AgentStatusCardProps) {
  const config = AGENT_CONFIG[agentId];
  const agentArtifacts = artifacts.filter(a => a.agentId === agentId);
  const compliant = agentArtifacts.filter(a => a.isCompliant).length;
  const violations = agentArtifacts.flatMap(a => a.violations).length;

  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <div className={`agent-avatar ${agentId}`}>
          {AGENT_ICONS[agentId]}
        </div>
        <div>
          <div className="agent-name">{config.name}</div>
          <div className="agent-role">{config.role}</div>
        </div>
      </div>
      <div className="agent-stats">
        <div>
          <div className="agent-stat-label">Artifacts</div>
          <div className="agent-stat-value">{agentArtifacts.length}</div>
        </div>
        <div>
          <div className="agent-stat-label">Compliant</div>
          <div className="agent-stat-value" style={{ color: 'var(--text-primary)' }}>{compliant}</div>
        </div>
        <div>
          <div className="agent-stat-label">Violations</div>
          <div className="agent-stat-value" style={{ color: violations > 0 ? 'var(--status-error)' : 'var(--text-tertiary)' }}>{violations}</div>
        </div>
      </div>
    </div>
  );
}
