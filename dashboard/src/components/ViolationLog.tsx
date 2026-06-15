import type { Violation } from '../lib/types';
import { CheckCircle2 } from 'lucide-react';

interface ViolationLogProps {
  violations: Violation[];
  maxItems?: number;
}

export default function ViolationLog({ violations, maxItems }: ViolationLogProps) {
  const displayViolations = maxItems ? violations.slice(0, maxItems) : violations;

  return (
    <div className="violation-log">
      <div className="violation-log-header">
        <span className="violation-log-title">Contract Violations</span>
        <span className="violation-count">{violations.length} detected</span>
      </div>
      <div className="violation-list">
        {displayViolations.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon"><CheckCircle2 size={32} /></div>
            <div className="empty-state-title">No violations</div>
            <div className="empty-state-description">All agents are compliant with the contracts</div>
          </div>
        ) : (
          displayViolations.map((v, i) => (
            <div key={v.id + i} className="violation-item">
              <div className={`violation-severity ${v.severity}`} />
              <div className="violation-content">
                <div className="violation-message">{v.message}</div>
                <div className="violation-meta">
                  <span className="violation-tag type">{v.type.replace(/_/g, ' ')}</span>
                  <span className="violation-tag service">{v.service}</span>
                  <span className="violation-tag agent">{v.agentId}</span>
                  <span className="violation-tag endpoint">{v.endpoint}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
