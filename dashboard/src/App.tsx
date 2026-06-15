import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExperimentDashboard from './pages/ExperimentDashboard';
import ResearchDashboard from './pages/ResearchDashboard';
import AgentMonitor from './pages/AgentMonitor';
import ContractViewer from './pages/ContractViewer';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <Routes>
          <Route path="/" element={<ExperimentDashboard />} />
          <Route path="/research" element={<ResearchDashboard />} />
          <Route path="/agents" element={<AgentMonitor />} />
          <Route path="/contracts" element={<ContractViewer />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
