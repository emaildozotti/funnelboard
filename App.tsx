
import React from 'react';
import FunnelCanvas from './components/FunnelCanvas';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <FunnelCanvas />
    </div>
  );
};

export default App;
