import React from 'react';
import './Tabs.css';

const Tabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs-container">
      <button
        className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('dashboard')}
      >
        <span className="tab-icon">📊</span>
        <span className="tab-label">Dashboard</span>
      </button>
      <button
        className={`tab ${activeTab === 'graficas' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('graficas')}
      >
        <span className="tab-icon">📈</span>
        <span className="tab-label">Gráficas</span>
      </button>
      <button
        className={`tab ${activeTab === 'historial' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('historial')}
      >
        <span className="tab-icon">📋</span>
        <span className="tab-label">Historial</span>
      </button>
    </div>
  );
};

export default Tabs;

