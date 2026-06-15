import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar } from 'recharts';
import MetricCard from '../components/MetricCard';
import { fetchExperimentResults } from '../lib/api';
import type { ExperimentResult } from '../lib/types';
import { ShieldAlert, CheckCircle2, ShieldCheck, Clock, CheckSquare, TrendingDown, X, Check } from 'lucide-react';

export default function ResearchDashboard() {
  const [data, setData] = useState<ExperimentResult | null>(null);

  useEffect(() => {
    fetchExperimentResults().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-state-title">Loading research data...</div>
        </div>
      </div>
    );
  }

  const { metrics } = data;

  const comparisonData = [
    { name: 'Integration Errors', withoutContracts: metrics.errorsWithoutContracts, withContracts: metrics.errorsWithContracts },
    { name: 'Failures Caught Early', withoutContracts: 0, withContracts: metrics.failuresCaughtEarly },
    { name: 'Debugging Hours', withoutContracts: metrics.estimatedDebuggingTimeSavedHours, withContracts: 0 },
  ];

  const complianceGauge = [
    { name: 'Compliance', value: metrics.contractComplianceRate, fill: '#000000' },
  ];

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Research Dashboard</h1>
        <p className="page-description">
          Quantitative analysis of how executable API contracts reduce integration defects in AI-assisted software development.
        </p>
      </div>

      <div className="metrics-grid stagger">
        <MetricCard
          label="Errors Without Contracts"
          value={metrics.errorsWithoutContracts}
          icon={<ShieldAlert size={24} />}
          delta="Would reach production undetected"
        />
        <MetricCard
          label="Errors With Contracts"
          value={metrics.errorsWithContracts}
          icon={<CheckCircle2 size={24} />}
          delta="All caught before deployment"
        />
        <MetricCard
          label="Failures Caught Early"
          value={metrics.failuresCaughtEarly}
          icon={<ShieldCheck size={24} />}
          delta="During development phase"
        />
        <MetricCard
          label="Debugging Time Saved"
          value={`${metrics.estimatedDebuggingTimeSavedHours}h`}
          icon={<Clock size={24} />}
          delta="~2h per integration failure"
        />
        <MetricCard
          label="Contract Compliance"
          value={`${metrics.contractComplianceRate}%`}
          icon={<CheckSquare size={24} />}
          delta="Across all agent outputs"
        />
        <MetricCard
          label="Error Reduction"
          value={`${metrics.reductionPercentage}%`}
          icon={<TrendingDown size={24} />}
          delta="With Specmatic contracts"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-title">Before vs After: Contract-Driven Development</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={comparisonData} barSize={40} barGap={8}>
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#09090b', fontSize: '0.8125rem' }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.8125rem', color: '#71717a' }}
              />
              <Bar dataKey="withoutContracts" name="Without Contracts" fill="#a1a1aa" radius={[6, 6, 0, 0]} opacity={0.85} />
              <Bar dataKey="withContracts" name="With Contracts" fill="#000000" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-title">Contract Compliance Rate</div>
          <div className="gauge-container">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={complianceGauge}
                startAngle={210}
                endAngle={-30}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={12}
                  background={{ fill: 'rgba(0,0,0,0.04)' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="gauge-value" style={{ color: '#000000', marginTop: '-2rem' }}>
              {metrics.contractComplianceRate}%
            </div>
            <div className="gauge-label">Overall Compliance</div>
          </div>
        </div>
      </div>

      {/* Scenarios Section */}
      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.3px' }}>
          Failure Scenarios: Without vs With Contracts
        </h2>
        <div className="scenarios-list stagger">
          {data.scenarios.map((scenario, i) => (
            <div key={i} className="scenario-card">
              <div className="scenario-header">
                <span className="scenario-name">{scenario.scenarioName}</span>
                <span className="scenario-badge caught">Caught by Specmatic</span>
              </div>
              <p className="scenario-description">{scenario.description}</p>
              <div className="scenario-comparison">
                <div className="scenario-column without">
                  <div className="scenario-column-title"><X size={16} /> Without Contracts</div>
                  <div className="scenario-column-text">{scenario.withoutContract.stage}</div>
                </div>
                <div className="scenario-column with">
                  <div className="scenario-column-title"><Check size={16} /> With Contracts</div>
                  <div className="scenario-column-text">{scenario.withContract.stage}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
