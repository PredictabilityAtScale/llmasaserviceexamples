import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type AgentType = 'sales' | 'onboarding' | 'llmaserviceinfo' | null;

export interface AgentContextData {
  [agentId: string]: any;
}

// Define the type for the updater function
type AgentContextUpdater = (prevData: AgentContextData) => AgentContextData;

interface AgentContextType {
  activeAgent: AgentType;
  setActiveAgent: (agent: AgentType) => void;
  agentContextData: AgentContextData;
  // Update the type definition to accept data OR an updater function
  updateAgentContextData: (agentId: string, dataOrUpdater: any | ((prevAgentData: any) => any)) => void;
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

  const updateAgentContextData = useCallback((agentId: string, dataOrUpdater: any | ((prevAgentData: any) => any)) => {
    setAgentContextData(prevData => {
      const currentAgentData = prevData[agentId] || {};
      // Check if dataOrUpdater is a function
      const newData = typeof dataOrUpdater === 'function' 
        ? dataOrUpdater(currentAgentData) // Call updater with current agent data
        : dataOrUpdater; // Use the data directly
      
      return {
        ...prevData,
        [agentId]: newData // Update only the specific agent's data
      };
    });
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