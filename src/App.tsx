import { Layout } from './components/layout/Layout';
import { Cpu, ExternalLink } from 'lucide-react';
import { Main } from './components/Main';
import { AgentProvider } from './context/AgentContext';

function App() {
  return (
    <AgentProvider>
      <Layout>
        {/* Header outside the main content area to span full width */}
        <header className="nav-style py-4 sticky top-0 z-20 w-full flex">
          {/* Main header section */}
          <div className="flex-1 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-indigo-600" />
              <h1 className="font-semibold text-xl">LLMAsaService Demo</h1>
            </div>
            <a 
              href="https://github.com/yourusername/llmasaservice-demo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <span>View on GitHub</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </header>
        
        {/* Main content component */}
        <Main />
      </Layout>
    </AgentProvider>
  );
}

export default App;
