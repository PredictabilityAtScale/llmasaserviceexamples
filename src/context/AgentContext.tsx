import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AgentType = 'sales' | 'onboarding' | 'llmaserviceinfo' | null;

export interface AgentContextData {
  [agentId: string]: any;
}

interface AgentContextType {
  activeAgent: AgentType;
  setActiveAgent: (agent: AgentType) => void;
  agentContextData: AgentContextData;
  updateAgentContextData: (agentId: string, data: any) => void;
  followOnPrompt: {[agentId: string]: string | null};
  setFollowOnPrompt: (agentId: string, prompt: string | null) => void;
  prospectName: string | null;
  prospectEmail: string | null;
  prospectCompany: string | null;
  setProspectName: (name: string | null) => void;
  setProspectEmail: (email: string | null) => void;
  setProspectCompany: (company: string | null) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [activeAgent, setActiveAgent] = useState<AgentType>('llmaserviceinfo');
  const [agentContextData, setAgentContextData] = useState<AgentContextData>({});
  const [followOnPrompt, setFollowOnPromptState] = useState<{[agentId: string]: string | null}>({});
  const [prospectName, setProspectNameState] = useState<string | null>(null);
  const [prospectEmail, setProspectEmailState] = useState<string | null>(null);
  const [prospectCompany, setProspectCompanyState] = useState<string | null>(null);

  // Use useCallback to maintain stable function reference
  const updateAgentContextData = useCallback((agentId: string, data: any) => {
    setAgentContextData(prevData => ({
      ...prevData,
      [agentId]: data
    }));
  }, []);

  const setFollowOnPrompt = useCallback((agentId: string, prompt: string | null) => {
    setFollowOnPromptState(prevPrompts => ({
      ...prevPrompts,
      [agentId]: prompt
    }));
  }, []);

  const setProspectName = useCallback((name: string | null) => {
    setProspectNameState(name);
  }, []);

  const setProspectEmail = useCallback((email: string | null) => {
    setProspectEmailState(email);
  }, []);

  const setProspectCompany = useCallback((company: string | null) => {
    setProspectCompanyState(company);
  }, []);

  return (
    <AgentContext.Provider value={{ 
      activeAgent, 
      setActiveAgent, 
      agentContextData, 
      updateAgentContextData,
      followOnPrompt,
      setFollowOnPrompt,
      prospectName,
      prospectEmail,
      prospectCompany,
      setProspectName,
      setProspectEmail,
      setProspectCompany
    }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
} 