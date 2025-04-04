import { ArrowRight, UserPlus } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { Sales } from './Sales';
import { Onboarding } from './Onboarding';

export function Main() {
  const { activeAgent, setActiveAgent } = useAgent();

  // If an agent is selected, show their content
  if (activeAgent) {
    switch (activeAgent) {
      case 'sales':
        return <Sales />;
      case 'onboarding':
        return <Onboarding />;
      case 'llmaserviceinfo':
        // For llmaserviceinfo, we want to show the welcome screen
        break;
      default:
        // If we somehow get an invalid agent, default to llmaserviceinfo
        setActiveAgent('llmaserviceinfo');
        break;
    }
  } else {
    // If no agent is selected (like when clicking "Back to Agents"), set it to llmaserviceinfo
    setActiveAgent('llmaserviceinfo');
  }

  // Show the welcome screen with agent cards
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 overflow-auto">
        <div className="content-area mb-10">
          <h2 className="text-3xl font-bold mb-6">
            <span className="text-gradient">Welcome to LLMAsaService Demo</span>
          </h2>
          
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          Step into the future of context-aware, conversational AI Agents with our cutting-edge LLMasaService platform. This interactive demo showcases our powerful, user-friendly UI components, featuring a dynamic resizable sidebar packed with intelligent AI agents. Experience firsthand how easily you can deploy secure, scalable, and customizable conversational AI solutions for your business needs. Whether you're looking to enhance customer support, streamline operations, or create engaging user experiences, our no-code agent builder and robust backend infrastructure make integrating advanced AI capabilities a breeze. Dive in and discover how LLMasaService can transform your digital customerinteractions!"
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="agent-card p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Sales Assistant</h3>
              </div>
              <p className="text-gray-600 mb-4">
              Experience the future of sales qualification with our Sales Assistant Demo. This demo combines conversational AI with real-time BANT (Budget, Authority, Need, Timeline) analysis to transform traditional sales qualification into an intelligent, dynamic process. Watch as our AI seamlessly extracts key qualification data from natural conversations, automatically populates your CRM, and provides instant insights—all while maintaining a complete audit trail of the qualification process. </p>
              
              <button 
                onClick={() => setActiveAgent('sales')}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                <span>Try it now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="agent-card p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold">Onboarding Agent</h3>
              </div>
              <p className="text-gray-600 mb-4">
              Experience effortless profile creation with our Onboarding Agent Demo. This demo showcases an AI-powered assistant that transforms the tedious process of building a professional profile into an interactive, guided experience. Watch as our intelligent coach analyzes your existing professional content, suggests targeted improvements, and automatically populates your profile fields in real-time. From crafting compelling headlines to organizing your expertise and services, the AI coach ensures a comprehensive, well-structured profile while maintaining a natural, conversational flow—making profile creation both efficient and engaging.
              </p>
              <button 
                onClick={() => setActiveAgent('onboarding')}
                className="btn-primary bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
              >
                <span>Try it now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-medium text-indigo-800 mb-3">How to use this demo</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Select an agent from the sidebar tabs to switch between different AI assistants</li>
              <li>Type your message in the input field at the bottom of the sidebar</li>
              <li>The agent will respond based on its specific capabilities</li>
              <li>You can resize the sidebar by dragging the divider between the main content and sidebar</li>
            </ol>
          </div>
        </div>
      </main>
      
      <footer className="flex-shrink-0 py-6 px-6 border-t border-gray-200">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">© 2024 LLMAsaService Demo. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">About</a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 