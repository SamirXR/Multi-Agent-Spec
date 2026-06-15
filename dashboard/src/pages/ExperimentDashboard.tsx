import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';
import ViolationLog from '../components/ViolationLog';
import AgentStatusCard from '../components/AgentStatusCard';
import { fetchExperimentResults } from '../lib/api';
import type { ExperimentResult, AgentId, Violation } from '../lib/types';
import { Activity, CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const AGENT_IDS: AgentId[] = ['frontend', 'backend', 'testing', 'documentation', 'api-design'];

const PIE_COLORS = ['#000000', '#71717a'];

export default function ExperimentDashboard() {
  const [data, setData] = useState<ExperimentResult | null>(null);

  useEffect(() => {
    fetchExperimentResults().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-state-title">Loading experiment data...</div>
        </div>
      </div>
    );
  }

  const allViolations: Violation[] = data.artifacts.flatMap(a => a.violations);

  const violationsByType = [
    { name: 'Field Mismatch', count: allViolations.filter(v => v.type === 'field_name_mismatch').length },
    { name: 'Datatype', count: allViolations.filter(v => v.type === 'datatype_violation').length },
    { name: 'Missing Field', count: allViolations.filter(v => v.type === 'missing_required_field').length },
    { name: 'Unexpected', count: allViolations.filter(v => v.type === 'unexpected_field').length },
    { name: 'Wrong Status', count: allViolations.filter(v => v.type === 'wrong_status_code').length },
    { name: 'Schema', count: allViolations.filter(v => v.type === 'schema_mismatch').length },
  ].filter(d => d.count > 0);

  const integrationPie = [
    { name: 'Successful', value: data.successfulIntegrations },
    { name: 'Failed', value: data.failedIntegrations },
  ];

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Experiment Dashboard</h1>
        <p className="page-description">
          Real-time overview of AI agent coordination experiment — monitoring API generation, integrations, and contract violations.
        </p>
      </div>

      <div className="metrics-grid stagger">
        <MetricCard label="Total APIs Generated" value={data.totalAPIs} icon={<Activity size={24} />} delta={`From ${data.agents.length} agents`} />
        <MetricCard label="Successful Integrations" value={data.successfulIntegrations} icon={<CheckCircle2 size={24} />} delta="Contract compliant" />
        <MetricCard label="Failed Integrations" value={data.failedIntegrations} icon={<XCircle size={24} />} delta="Contract violations found" />
        <MetricCard label="Violations Detected" value={data.violationsDetected} icon={<AlertTriangle size={24} />} delta="By Specmatic" />
        <MetricCard label="Prevented Before Deploy" value={data.violationsPreventedBeforeDeployment} icon={<ShieldAlert size={24} />} delta="100% catch rate" />
      </div>

      <div className="agents-grid stagger">
        {AGENT_IDS.map(id => (
          <AgentStatusCard key={id} agentId={id} artifacts={data.artifacts} />
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-title">Violations by Type</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={violationsByType} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#09090b', fontSize: '0.8125rem' }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="count" fill="#000000" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-title">Integration Success Rate</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={integrationPie}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {integrationPie.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#09090b', fontSize: '0.8125rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '-1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#71717a' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#000000' }} /> Successful ({data.successfulIntegrations})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#71717a' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#71717a' }} /> Failed ({data.failedIntegrations})
            </div>
          </div>
        </div>
      </div>

      <ViolationLog violations={allViolations} />
    </div>
  );
}
