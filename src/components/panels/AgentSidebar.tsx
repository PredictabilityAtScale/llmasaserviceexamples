import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Info, X, ChevronRight, ChevronLeft, Sparkles, Settings, Cpu, Code, UserPlus, Clock } from 'lucide-react';
import { AgentPanel } from 'llmasaservice-ui';
import { useAgent } from '../../context/AgentContext';

// Simplified agent configuration type
export type AgentConfig = {
  id: string;
  name: string;
  agentId: string;
  capabilities?: string;
  avatarUrl?: string;
  isVisible?: boolean;
};

interface AgentSidebarProps {
  agents: AgentConfig[];
  initialPanelWidth?: number;
  minimumMainWidth?: number; // Min width for the *content* area, not sidebar
  initialCollapsed?: boolean;
}

// Add an interface for the chat history
interface ChatHistoryEntry {
  content: string;
  callId: string;
  prompt?: string;
  response?: string;
}

interface ChatHistory {
  [key: string]: ChatHistoryEntry;
}

// Helper function to get the icon and background color for each agent type
function getAgentIcon(agentId: string, isActive: boolean, agents: AgentConfig[]) {
  const circleSize = isActive 
    ? "h-8 w-8 md:h-10 md:w-10" 
    : "h-8 w-8";
  
  const iconSize = isActive 
    ? "h-4 w-4 md:h-5 md:w-5" 
    : "h-4 w-4";

  // Get the agent type from demoAgents
  const agent = agents.find(a => a.agentId === agentId);
  const agentType = agent?.id || 'default';

  switch (agentType) {
    case 'helpdesk':
      return (
        <div className={`${circleSize} bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600`}>
          <Cpu className={iconSize} />
        </div>
      );
    case 'content-coach':
      return (
        <div className={`${circleSize} bg-purple-100 rounded-full flex items-center justify-center text-purple-600`}>
          <Code className={iconSize} />
        </div>
      );
    case 'sales':
      return (
        <div className={`${circleSize} bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconSize}>
            <path d="M3 3v18h18"/>
            <path d="m19 9-5 5-4-4-3 3"/>
          </svg>
        </div>
      );
    case 'onboarding':
      return (
        <div className={`${circleSize} bg-amber-100 rounded-full flex items-center justify-center text-amber-600`}>
          <UserPlus className={iconSize} />
        </div>
      );
    case 'llmaserviceinfo':
      return (
        <div className={`${circleSize} bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden`}>
          <img 
            src="https://llmasaservice.io/wp-content/uploads/2024/07/icon-72x72-1.png" 
            alt="LLMasaService" 
            className={`${iconSize} object-cover`}
          />
        </div>
      );
    default:
      return (
        <div className={`${circleSize} bg-gray-100 rounded-full flex items-center justify-center text-gray-600`}>
          <Bot className={iconSize} />
        </div>
      );
  }
}

export function AgentSidebar({ 
  agents,
  initialPanelWidth = 513,
  minimumMainWidth = 320,
  initialCollapsed = true 
}: AgentSidebarProps) {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isDragging, setIsDragging] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  
  // State for chat history
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<{
    callId: string;
    prompt: string;
    response: string;
  } | null>(null);
  
  const { 
    activeAgent, 
    setActiveAgent, 
    agentContextData, 
    followOnPrompt, 
    setFollowOnPrompt,
    prospectName,
    prospectEmail,
    prospectCompany 
  } = useAgent();
  
  // Only show visible agents in the tabs
  const visibleAgents = agents.filter(agent => agent.isVisible !== false);
  
  // Find the active agent config based on the activeAgent ID from context
  const activeAgentConfig = visibleAgents.find(agent => agent.id === activeAgent) || null;
  
  // Get the context data for the active agent
  const activeAgentContextData = activeAgent ? agentContextData[activeAgent] : undefined;
  
  // Update the active agent when tab is clicked
  const handleAgentSelect = (index: number) => {
    setActiveAgent(visibleAgents[index].id as any);
  };

  // Panel resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new width based on mouse position from left edge
      const newWidth = e.clientX;
      
      // Set min (300px) and max widths
      const clampedWidth = Math.max(300, Math.min(window.innerWidth - minimumMainWidth, newWidth));
      
      setPanelWidth(clampedWidth);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.classList.add('resizing');
    } else {
      document.body.classList.remove('resizing');
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resizing');
    };
  }, [isDragging, minimumMainWidth]);

  const currentWidth = isCollapsed ? 50 : panelWidth;

  // Toggle collapse/expand
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // This is used to still keep track of history
  const handleHistoryChanged = useCallback((history: {
    [key: string]: { content: string; callId: string };
  }) => {
    // Store the history but don't show the modal
    setChatHistory(prevHistory => {
      // Create a new history object that preserves prompt/response from previous state
      const newHistory = { ...prevHistory };
      
      // Update with new entries from the historyChanged callback
      Object.entries(history).forEach(([key, entry]) => {
        newHistory[key] = {
          ...entry,
          prompt: newHistory[key]?.prompt || '',
          response: newHistory[key]?.response || ''
        };
      });
      
      return newHistory;
    });
  }, []);
  
  // Response complete callback to update history and show modal
  const handleResponseComplete = useCallback((callId: string, prompt: string, response: string) => {
    console.log('Response complete:', { callId, prompt, response });
    
    setCurrentResponse({ callId, prompt, response });
    
    // Update history with the prompt and response
    setChatHistory(prevHistory => {
      const newHistory = { ...prevHistory };
      
      // Find the entry with this callId
      const key = Object.keys(newHistory).find(k => newHistory[k].callId === callId);
      
      if (key) {
        // Update existing entry
        newHistory[key] = {
          ...newHistory[key],
          prompt,
          response
        };
      } else {
        // Create a new entry if we don't have it yet
        const newKey = `message-${Date.now()}`;
        newHistory[newKey] = {
          callId,
          content: response,
          prompt,
          response
        };
      }
      
      return newHistory;
    });
    
    // IMPORTANT: Modal showing is temporarily disabled for LLMasaService and Onboarding agents
    // This code should be preserved for future agents that may need to show the modal
    // setShowHistoryModal(true);
  }, []);

  return (
    // This div is the flex item for the sidebar
    <div 
      style={{ width: `${currentWidth}px` }}
      className="relative flex-shrink-0 min-h-full flex border-r border-gray-200"
    >
      {/* Agent Panel Container - takes full height within this flex item */}
      <div 
        className="glass-panel h-full flex flex-col flex-1 transition-all duration-300 ease-in-out overflow-hidden"
      >
        {/* Header space with tabs */}
        <div className="h-[60px] flex-shrink-0 flex items-center">
          {visibleAgents.length > 1 && (
            <div className="flex items-end px-2 flex-1 overflow-x-auto">
              {visibleAgents.map((agent, index) => {
                const isActive = agent.id === activeAgent;
                
                return (
                  <div key={agent.id} className="relative">
                    <button
                      onClick={() => handleAgentSelect(index)}
                      className={`
                        px-4 py-2 flex items-center gap-2 focus:outline-none
                        ${isActive 
                          ? 'bg-white text-indigo-700 font-medium border-b-2 border-indigo-600' 
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'}
                      `}
                    >
                      {getAgentIcon(agent.agentId, isActive, agents)}
                      <span className={`text-xs leading-tight ${isActive ? 'font-medium' : ''}`}>
                        {agent.name}
                      </span>
                      
                      {/* Context info button */}
                      {isActive && activeAgentContextData && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowContextModal(true);
                          }}
                          className="ml-1 text-gray-400 hover:text-indigo-600 focus:outline-none p-0 inline-flex items-center justify-center"
                          aria-label="View context data"
                        >
                          <Info className="h-3 w-3" />
                        </button>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Collapsed View */}
        {isCollapsed && (
          <div className="flex-1 flex flex-col items-center py-6 space-y-6 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto">
            {visibleAgents.map((agent, index) => (
              <button
                key={agent.id}
                onClick={() => {
                  handleAgentSelect(index);
                }}
                className={`p-2 rounded-full flex items-center justify-center transition-all duration-200
                  ${agent.id === activeAgent 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title={agent.name}
              >
                {getAgentIcon(agent.agentId, agent.id === activeAgent, agents)}
              </button>
            ))}
          </div>
        )}

        {/* Expanded View */}
        {!isCollapsed && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Agent header - only show for single agent */}
            {visibleAgents.length <= 1 && activeAgentConfig && (
              <div className="flex items-center p-3 border-b border-indigo-100 flex-shrink-0 bg-white bg-opacity-90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  {activeAgentConfig.avatarUrl ? (
                    <img 
                      src={activeAgentConfig.avatarUrl} 
                      alt={activeAgentConfig.name}
                      className="h-10 w-10 rounded-full object-cover border border-indigo-100 flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {activeAgentConfig.name || 'AI Assistant'}
                    </h3>
                    {activeAgentConfig.capabilities && (
                      <p className="text-xs text-gray-500 leading-tight">
                        {activeAgentConfig.capabilities}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                  {activeAgentContextData && (
                    <button 
                      onClick={() => setShowContextModal(true)}
                      className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-50 focus:outline-none"
                      aria-label="View context data"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-50 focus:outline-none"
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Agent Panel itself */} 
            <div className="flex-1 min-h-0 overflow-hidden bg-white">
              {visibleAgents.map((agent, index) => {
                const isActive = agent.id === activeAgent;
                const agentData = agentContextData[agent.id];
                
                // For sales agents, add prospect information from context
                let agentPanelData: { key: string; data: string }[] = [];
                if (agentData) {
                  agentPanelData = Object.entries(agentData)
                    .filter(([key, value]) => 
                      key !== 'salesActions' && 
                      key !== 'responseCompleteCallback'
                    )
                    .map(([key, value]) => ({
                      key,
                      data: typeof value === 'object' ? JSON.stringify(value) : String(value)
                    }));
                }

                // Add prospect information to the data array for the "sales" agent
                if (agent.id === 'sales') {
                  // Add prospect information if available
                  if (prospectName) {
                    agentPanelData.push({
                      key: 'prospectName',
                      data: prospectName
                    });
                  }
                  if (prospectEmail) {
                    agentPanelData.push({
                      key: 'prospectEmail',
                      data: prospectEmail
                    });
                  }
                  if (prospectCompany) {
                    agentPanelData.push({
                      key: 'prospectCompany',
                      data: prospectCompany
                    });
                  }
                }
                
                return (
                  <div 
                    key={agent.id} 
                    className={`${isActive ? 'h-full' : 'h-0 overflow-hidden'}`}
                  >
                    <div className={`${isActive ? 'h-full py-3 px-1' : 'h-0'}`}>
                      <AgentPanel
                        agent={agent.agentId}
                        data={agentPanelData}
                        actions={
                          agent.id === 'sales' 
                            ? agentData?.salesActions || [] 
                            : agent.id === 'onboarding' 
                              ? agentData?.onboardingActions || [] 
                              : []
                        }
                        // @ts-ignore Using props that may not be in the type definition yet
                        historyChangedCallback={handleHistoryChanged}
                        // If agent data has its own responseCompleteCallback, use that, otherwise use our local one
                        // @ts-ignore Using props that may not be in the type definition yet
                        responseCompleteCallback={agentData?.responseCompleteCallback || handleResponseComplete}
                        // @ts-ignore Using props that may not be in the type definition yet
                        followOnPrompt={followOnPrompt[agent.id] || null}
                        // @ts-ignore Using props that may not be in the type definition yet
                        onFollowOnPromptSent={() => setFollowOnPrompt(agent.id, null)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resize handle and collapse button container */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-100 active:bg-indigo-200 transition-colors duration-200"
        onMouseDown={handleMouseDown}
      >
        {/* Collapse/Expand button */}
        <button 
          onClick={toggleCollapse}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 bg-indigo-600 text-white p-1 rounded-r-md shadow-md hover:bg-indigo-700 transition-colors duration-200 h-12 flex items-center justify-center z-10"
          aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Context Modal - remains fixed */} 
      {showContextModal && activeAgentConfig && activeAgentContextData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowContextModal(false)}>
          <div 
            className="glass-panel rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Info className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Context Data for {activeAgentConfig.name}</h3>
              </div>
              <button 
                onClick={() => setShowContextModal(false)} 
                className="text-gray-400 hover:text-gray-500 bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(activeAgentContextData).map(([key, value]) => (
                <div key={key} className="border border-indigo-100 rounded-lg p-4 bg-white bg-opacity-80">
                  <h4 className="font-medium text-indigo-800 mb-2 text-sm uppercase tracking-wider flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                    {key}
                  </h4>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-60 border border-gray-100 text-gray-700">
                    {key === 'formContext' ? (
                      <div className="space-y-2">
                        <div>
                          <h5 className="font-medium text-indigo-700">Basic Info</h5>
                          <pre className="mt-1">{JSON.stringify((value as any).basicInfo, null, 2)}</pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-indigo-700">Contact & Links</h5>
                          <pre className="mt-1">{JSON.stringify((value as any).contactLinks, null, 2)}</pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-indigo-700">Narrative Bio</h5>
                          <pre className="mt-1">{JSON.stringify((value as any).narrativeBio, null, 2)}</pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-indigo-700">Expertise</h5>
                          <pre className="mt-1">{JSON.stringify((value as any).expertise, null, 2)}</pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-indigo-700">Services</h5>
                          <pre className="mt-1">{JSON.stringify((value as any).services, null, 2)}</pre>
                        </div>
                      </div>
                    ) : (
                      JSON.stringify(value, null, 2)
                    )}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowHistoryModal(false)}>
          <div 
            className="glass-panel rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Chat History</h3>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)} 
                className="text-gray-400 hover:text-gray-500 bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(chatHistory).length > 0 ? (
                Object.entries(chatHistory).map(([key, entry]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white bg-opacity-80">
                    <h4 className="font-medium text-gray-800 mb-2 text-sm flex items-center justify-between">
                      <span>Message ID: {key}</span>
                      <span className="text-xs text-gray-500">Call ID: {entry.callId}</span>
                    </h4>
                    
                    {entry.prompt && (
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-gray-600 mb-1">Prompt:</h5>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm overflow-auto max-h-40 border border-gray-100 text-gray-700">
                          {entry.prompt}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-1">Response:</h5>
                      <div className="bg-blue-50 p-3 rounded-lg text-sm overflow-auto max-h-40 border border-blue-100 text-gray-800">
                        {entry.response || entry.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No chat history available
                </div>
              )}
            </div>
            
            {/* Highlight the current response if available */}
            {currentResponse && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                  Latest Response (Call ID: {currentResponse.callId})
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-1">Prompt:</h5>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm overflow-auto max-h-40 border border-gray-100 text-gray-700">
                      {currentResponse.prompt}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-1">Response:</h5>
                    <div className="bg-green-50 p-3 rounded-lg text-sm overflow-auto max-h-40 border border-green-100 text-gray-800">
                      {currentResponse.response}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 