import React, { useState } from 'react';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import MachineMonitoring from './pages/MachineMonitoring';
import DiagnoseMachine from './pages/DiagnoseMachine';
import KnowledgeBase from './pages/KnowledgeBase';
import DiagnosisHistory from './pages/DiagnosisHistory';
import Reports from './pages/Reports';
import AboutProject from './pages/AboutProject';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [preselectedMachine, setPreselectedMachine] = useState(null);

  const handleSelectMachineForDiagnosis = (machine) => {
    setPreselectedMachine(machine);
    setActiveTab('diagnose');
  };

  const handleDiagnosisComplete = (result) => {
    // Diagnosis completed callback
    console.log('Diagnosis completed:', result);
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard
          setActiveTab={setActiveTab}
          setSelectedMachineId={(id) => {
            setPreselectedMachine({ id, machine_name: id, latest_reading: {} });
            setActiveTab('diagnose');
          }}
        />
      )}

      {activeTab === 'monitoring' && (
        <MachineMonitoring
          setActiveTab={setActiveTab}
          onSelectMachineForDiagnosis={handleSelectMachineForDiagnosis}
        />
      )}

      {activeTab === 'diagnose' && (
        <DiagnoseMachine
          preselectedMachine={preselectedMachine}
          onDiagnosisComplete={handleDiagnosisComplete}
        />
      )}

      {activeTab === 'knowledge-base' && (
        <KnowledgeBase setActiveTab={setActiveTab} />
      )}

      {activeTab === 'history' && (
        <DiagnosisHistory
          setActiveTab={setActiveTab}
          onSelectMachineForDiagnosis={handleSelectMachineForDiagnosis}
        />
      )}

      {activeTab === 'reports' && (
        <Reports />
      )}

      {activeTab === 'about' && (
        <AboutProject setActiveTab={setActiveTab} />
      )}
    </AppLayout>
  );
}
