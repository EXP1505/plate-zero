import React from 'react';
import DashboardLayout from './components/DashboardLayout';
import DashboardCharts from './components/DashboardCharts';

function App() {
  return (
    <DashboardLayout>
      <DashboardCharts />
    </DashboardLayout>
  );
}

export default App;
