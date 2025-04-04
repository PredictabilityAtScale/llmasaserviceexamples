import type { AgentConfig } from './../components/panels/AgentSidebar';

export const demoAgents: AgentConfig[] = [
  {
    id: 'llmaserviceinfo',
    name: 'LLMasaService',
    agentId: import.meta.env.VITE_LLMASASERVICE_DEMO_LLMASERVICE_AGENT_ID,
    capabilities: 'Information about LLMasaService and its capabilities',
    isVisible: true
  },
  {
    id: 'sales',
    name: 'Sales Assistant',
    agentId: import.meta.env.VITE_LLMASASERVICE_DEMO_SALES_AGENT_ID,
    capabilities: 'Sales strategies and market analysis',
    isVisible: true
  },
  {
    id: 'onboarding',
    name: 'Onboarding Agent',
    agentId: import.meta.env.VITE_LLMASASERVICE_DEMO_ONBOARDING_AGENT_ID,
    capabilities: 'Expert profile creation and onboarding assistance',
    isVisible: true
  },
  {
    id: 'bant-extractor',
    name: 'BANT Extractor',
    agentId: import.meta.env.VITE_LLMASASERVICE_DEMO_BANT_EXTRACTOR_AGENT_ID,
    capabilities: 'Extracts BANT information from a sales conversation',
    isVisible: false
  }
]; 