import { ReactNode } from 'react';
import { AgentSidebar } from '../panels/AgentSidebar';
import { demoAgents } from '../../utils/demoAgents';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Agent sidebar - has its own width */}
      <AgentSidebar 
        agents={demoAgents}
        initialPanelWidth={513}
        minimumMainWidth={320}
        initialCollapsed={false}
      />
      
      {/* Main content area - takes remaining space */}
      <div className="flex-1 overflow-auto main-content-area h-screen">
        {children}
      </div>
    </div>
  );
} 