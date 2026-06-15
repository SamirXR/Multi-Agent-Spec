import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Bot, FileCode2, Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <Zap size={18} color="white" />
          </div>
          <span className="navbar-title">AI Software Factory</span>
          <span className="navbar-subtitle">Specmatic Contract Research</span>
        </div>
        <ul className="navbar-nav">
          <li>
            <NavLink to="/" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`} end>
              <LayoutDashboard size={16} /> Experiment
            </NavLink>
          </li>
          <li>
            <NavLink to="/research" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              <BarChart2 size={16} /> Research
            </NavLink>
          </li>
          <li>
            <NavLink to="/agents" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              <Bot size={16} /> Agents
            </NavLink>
          </li>
          <li>
            <NavLink to="/contracts" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              <FileCode2 size={16} /> Contracts
            </NavLink>
          </li>
          <li>
            <span className="navbar-badge">Live</span>
          </li>
        </ul>
      </div>
    </nav>
  );
}
