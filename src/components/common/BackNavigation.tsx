import { ArrowLeft } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export function BackNavigation() {
  const { setActiveAgent } = useAgent();

  return (
    <button
      onClick={() => setActiveAgent(null)}
      className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back to Agents</span>
    </button>
  );
} 