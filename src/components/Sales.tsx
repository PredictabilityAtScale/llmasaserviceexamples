import { DollarSign, Users, LineChart, Briefcase, PieChart, Target, Info, Clipboard, X, Check, BookOpen, Sparkles } from 'lucide-react';
import { BackNavigation } from './common/BackNavigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAgent } from '../context/AgentContext';
import { useLLM } from 'llmasaservice-client';
import { demoAgents } from '../utils/demoAgents';

// Add CSS for flash effect
const flashHighlightStyle = document.createElement('style');
flashHighlightStyle.textContent = `
  @keyframes flashHighlight {
    0% { background-color: transparent; }
    50% { background-color: rgba(59, 130, 246, 0.1); }
    100% { background-color: transparent; }
  }
  
  .flash-highlight {
    animation: flashHighlight 1.5s ease-in-out;
  }
`;
document.head.appendChild(flashHighlightStyle);

// Helper function to process sales buttons
const processSalesButtons = (
  agentContextData: any,
  updateAgentContextData: (agentId: string, data: any) => void,
  setProspectName: (name: string | null) => void,
  setProspectEmail: (email: string | null) => void,
  setProspectCompany: (company: string | null) => void,
) => {
  // Find all elements with the sales-button class
  const salesButtons = document.querySelectorAll('.sales-button');
  
  salesButtons.forEach((button) => {
    // Skip if already processed
    if (button.classList.contains('sales-button-processed')) return;
    
    // Mark as processed
    button.classList.add('sales-button-processed');
    
    // Try to find if there was a match that triggered this button
    // We'll look for data attributes that might be set by the AI framework
    const matchData = button.getAttribute('data-match');
    
    // Parse values from the match if possible
    let nameValue = '';
    let emailValue = '';
    let companyValue = '';
    
    // If we have match data, try to extract values
    if (matchData) {
      try {
        const matchObj = JSON.parse(matchData);
        if (matchObj && matchObj.groups) {
          nameValue = matchObj.groups[0] || '';
          emailValue = matchObj.groups[1] || '';
          companyValue = matchObj.groups[2] || '';
        }
      } catch (e) {
        console.error('Error parsing match data:', e);
      }
    }
    
    // Clear the button's content
    button.innerHTML = '';
    
    // Create a title element
    const title = document.createElement('div');
    title.className = 'text-sm font-medium text-blue-600 mb-3';
    title.textContent = 'Contact Information Form';
    button.appendChild(title);
    
    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    
    // Create name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Full Name';
    nameInput.className = 'full-width';
    nameInput.value = nameValue;
    inputContainer.appendChild(nameInput);
    
    // Create another input container
    const secondInputContainer = document.createElement('div');
    secondInputContainer.className = 'input-container';
    
    // Create email input
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Email Address';
    emailInput.value = emailValue;
    secondInputContainer.appendChild(emailInput);
    
    // Create company input instead of phone
    const companyInput = document.createElement('input');
    companyInput.type = 'text';
    companyInput.placeholder = 'Company Name';
    companyInput.value = companyValue;
    secondInputContainer.appendChild(companyInput);
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Information';
    submitButton.className = 'mt-3';
    
    // Add event listener to the submit button
    submitButton.addEventListener('click', () => {
      // Get the values from the inputs
      const name = nameInput.value;
      const email = emailInput.value;
      const company = companyInput.value;
      
      // Update the prospect information in the context
      if (name) setProspectName(name);
      if (email) setProspectEmail(email);
      if (company) setProspectCompany(company);
      
      // Update agent context data with prospect information
      const currentSalesContext = { ...agentContextData['sales'] };
      currentSalesContext.prospectName = name;
      currentSalesContext.prospectEmail = email;
      currentSalesContext.prospectCompany = company;
      updateAgentContextData('sales', currentSalesContext);
      
      // Find the lead qualification form fields
      const contactNameField = document.getElementById('contactName') as HTMLInputElement;
      const contactEmailField = document.getElementById('contactEmail') as HTMLInputElement;
      const companyNameField = document.getElementById('companyName') as HTMLInputElement;
      
      // Update the lead qualification form fields if they exist
      if (contactNameField) {
        contactNameField.value = nameInput.value;
        // Add flash effect
        contactNameField.classList.add('flash-highlight');
        setTimeout(() => contactNameField.classList.remove('flash-highlight'), 1500);
      }
      
      if (contactEmailField) {
        contactEmailField.value = emailInput.value;
        // Add flash effect
        contactEmailField.classList.add('flash-highlight');
        setTimeout(() => contactEmailField.classList.remove('flash-highlight'), 1500);
      }
      
      if (companyNameField) {
        companyNameField.value = companyInput.value;
        // Add flash effect
        companyNameField.classList.add('flash-highlight');
        setTimeout(() => companyNameField.classList.remove('flash-highlight'), 1500);
      }
      
      // Scroll to the form
      const leadQualificationForm = document.querySelector('.bg-white.rounded-xl');
      if (leadQualificationForm) {
        leadQualificationForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Replace the entire form with a success message
      button.innerHTML = '';
      
      // Create success message container
      const successMessage = document.createElement('div');
      successMessage.className = 'text-center py-3 px-4 bg-gray-50 border border-gray-100 rounded-lg';
      
      // Add a subtle success icon
      const successIcon = document.createElement('div');
      successIcon.className = 'mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-green-50 mb-2';
      successIcon.innerHTML = '<svg class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      successMessage.appendChild(successIcon);
      
      // Add success message
      const successText = document.createElement('p');
      successText.className = 'text-sm text-gray-600';
      successText.textContent = 'Information added to qualification form';
      successMessage.appendChild(successText);
      
      // Append the success message to the button container
      button.appendChild(successMessage);
      
      // Set the follow-on prompt using the global event dispatcher
      const event = new CustomEvent('set-follow-on-prompt', { 
        detail: { agentId: 'sales', prompt: 'ok, done' } 
      });
      window.dispatchEvent(event);
    });
    
    // Append all elements to the button
    button.appendChild(inputContainer);
    button.appendChild(secondInputContainer);
    button.appendChild(submitButton);
  });
};


// First, let's add a new interface for conversation messages
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Add interface for insights
interface Insight {
  id: string;
  timestamp: Date;
  type: 'update' | 'insight';
  field?: string;
  value?: string;
  message: string;
  category: 'identification' | 'need' | 'authority' | 'budget' | 'timeline' | 'qualification' | 'system';
}

export function Sales() {
  const [activeTab, setActiveTab] = useState<'company' | 'value' | 'product'>('company');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const { 
    updateAgentContextData, 
    agentContextData, 
    setFollowOnPrompt,
    setProspectName,
    setProspectEmail,
    setProspectCompany
  } = useAgent();
  
  // Create a ref to track if we've already set the context
  const contextSetRef = useRef(false);
  
  // State for BANT analysis
  const [isProcessingBant, setIsProcessingBant] = useState(false);
  
  // State for real-time insights
  const [insights, setInsights] = useState<Insight[]>([]);

  // Set up the event listener for setting the follow-on prompt
  useEffect(() => {
    // Define our custom event type
    type SetFollowOnPromptEvent = CustomEvent<{ agentId: string; prompt: string }>;
    
    const handleSetFollowOnPrompt = (event: SetFollowOnPromptEvent) => {
      const { agentId, prompt } = event.detail;
      setFollowOnPrompt(agentId, prompt);
    };

    // Add event listener
    window.addEventListener('set-follow-on-prompt', handleSetFollowOnPrompt as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('set-follow-on-prompt', handleSetFollowOnPrompt as EventListener);
    };
  }, [setFollowOnPrompt]);

  // Get the LLM hook for the BANT extractor agent
  const bantExtractorAgentId = demoAgents.find(agent => agent.id === 'bant-extractor')?.agentId || '';
  const { send } = useLLM({
    project_id: "7006eb08-8cbf-49dc-9e89-02a5e6d876eb", // Required field for LLMServiceType
    agent: bantExtractorAgentId
  });

  // Company description markdown content
  const companyDescription = `
# Company Description

**Company Name:** ConverseAI Solutions

**Description:**
ConverseAI Solutions is redefining the landscape of customer relationship management. We believe that the most valuable asset for any sales, marketing, or service professional is their time and their ability to build genuine connections. Founded on the principle of eliminating drudgery, ConverseAI Solutions develops cutting-edge AI technology that powers the world's first truly conversational CRM platform. Our mission is to free professionals from the burden of manual data entry, allowing them to focus entirely on strategic thinking, customer engagement, and driving business growth through natural, intuitive interaction with their CRM system. We are building the future of work, where technology adapts to human workflow, not the other way around.
`;

  // Value proposition markdown content
  const valueProposition = `
# Value Proposition

**Target Audience:** Sales Teams, Marketing Professionals, Customer Success Managers, and Business Leaders frustrated with the time cost and inefficiency of traditional CRM data entry.

**Problem:** Traditional CRMs require significant manual data input, which is time-consuming, prone to errors, leads to incomplete records, reduces user adoption, and distracts professionals from revenue-generating activities and genuine customer interaction.

**Our Solution:** ConverseAI CRM offers a revolutionary AI-powered platform where users manage all CRM functions – updating contacts, logging activities, tracking deals, scheduling follow-ups – simply by conversing (via voice or text) with an intelligent AI agent.

**Unique Benefit & Outcome:** Unlike any other CRM, ConverseAI CRM **completely eliminates manual data entry**. By simply talking or typing naturally, users reclaim hours previously lost to administrative tasks each week. This leads to:
* **Massive Time Savings:** Dramatically reduce time spent on CRM admin.
* **Increased Productivity:** Focus efforts on selling, marketing, and supporting customers.
* **Improved Data Quality & Completeness:** AI captures details accurately and consistently from conversations.
* **Enhanced User Adoption:** An intuitive, effortless interface encourages consistent use.
* **Actionable Insights:** AI not only logs data but can also provide summaries and insights on demand.
* **Faster Deal Cycles:** Quicker updates and follow-ups keep momentum going.

**In essence: ConverseAI CRM transforms your CRM from a tedious database into an intelligent, effortless productivity partner, allowing your team to operate at peak efficiency and focus solely on building relationships and closing deals.**
`;

  // Product description markdown content
  const productDescription = `
# Product Description

**Product Name:** ConverseAI CRM

**Description:**
ConverseAI CRM is a cloud-based Software-as-a-Service (SaaS) platform that functions as your intelligent Customer Relationship Management hub, uniquely operated through natural language interaction. Forget forms, fields, and manual logging. With ConverseAI CRM, you interact with a dedicated AI agent via voice or text.

**How it Works:**
Simply tell your AI agent about your interactions:
* *"Just finished a call with Jane Doe at Acme Corp. We discussed the new proposal, potential value is $50k, and I need to follow up next Tuesday with pricing details."*
* *"Log a meeting with John Smith from Beta Industries. Key takeaway: they're interested but concerned about integration timelines."*
* *"Update the deal stage for Omega Project to 'Negotiation'."*
* *"What's my pipeline look like for this quarter?"*
* *"Remind me to check in with Gamma Co. tomorrow morning."*

The AI agent intelligently parses your commands and conversation summaries, automatically identifying contacts, companies, activities, deal values, next steps, sentiment, and more. It then structures this information and seamlessly updates the relevant records within the CRM database in real-time, without you ever needing to navigate complex menus or type into data fields.

**Key Features:**
* **Conversational Interface:** Interact via voice or text using natural language.
* **Automated Data Capture & Entry:** AI listens, understands, and logs CRM data automatically.
* **Intelligent Activity Logging:** Captures calls, meetings, emails (via forwarding/integration), and notes effortlessly.
* **Task & Reminder Management:** Set follow-ups and reminders through simple commands.
* **Deal & Pipeline Tracking:** Update stages, amounts, and probabilities conversationally.
* **Contact & Company Management:** Add or update contact/company information on the fly.
* **AI-Powered Insights:** Ask your AI for quick summaries, reports, or to retrieve customer history.
* **Seamless Integration:** Designed to integrate with email, calendar, and potentially other sales/marketing tools (future capability).

ConverseAI CRM isn't just a tool; it's your tireless virtual assistant, ensuring your CRM is always up-to-date while freeing you to focus entirely on what matters most – your customers.
`;

  // Add new state for the conversation history
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  // Ref to signal that BANT analysis should run after history update
  const shouldRunBantAnalysis = useRef(false);

  // Add state for the demo modal
  const [showDemoModal, setShowDemoModal] = useState(false);
  
  // Add function to collect form data
  const getFormData = useCallback(() => {
    const formData: Record<string, string | boolean> = {};
    
    // Helper function to get field value
    const getFieldValue = (id: string) => {
      const field = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!field) return null;
      
      if (field instanceof HTMLInputElement && field.type === 'checkbox') {
        return field.checked;
      }
      
      return field.value;
    };
    
    // Collect all form field values
    const fields = [
      'contactName', 'companyName', 'contactEmail',
      'coreProblemMatch', 'needSummary', 'needNotes',
      'decisionRole', 'authorityNotes',
      'budgetIndication', 'budgetNotes',
      'purchaseTimeline', 'timelineNotes',
      'bantFit', 'nextStep', 'outcomeNotes'
    ];
    
    fields.forEach(field => {
      const value = getFieldValue(field);
      if (value !== null) {
        formData[field] = value;
      }
    });
    
    return formData;
  }, []);

  // Helper function to add an insight with category
  const addInsight = useCallback((type: 'update' | 'insight', message: string, category: Insight['category'], field?: string, value?: string) => {
    const newInsight: Insight = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      field,
      value,
      message,
      category
    };

    setInsights(prev => {
      // Remove old insights of the same category if they're updates
      const filteredPrev = prev.filter(i => 
        !(i.category === category && i.type === 'update' && i.field === field)
      );
      
      // Add new insight at the beginning
      const newInsights = [newInsight, ...filteredPrev];
      
      // Keep only the most recent 10 insights
      return newInsights.slice(0, 10);
    });
  }, []);

  // Helper function to get category color
  const getCategoryColor = (category: Insight['category']) => {
    switch (category) {
      case 'identification':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      case 'need':
        return 'bg-green-50 border-green-100 text-green-600';
      case 'authority':
        return 'bg-purple-50 border-purple-100 text-purple-600';
      case 'budget':
        return 'bg-yellow-50 border-yellow-100 text-yellow-600';
      case 'timeline':
        return 'bg-orange-50 border-orange-100 text-orange-600';
      case 'qualification':
        return 'bg-red-50 border-red-100 text-red-600';
      case 'system':
        return 'bg-gray-50 border-gray-100 text-gray-600';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-600';
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: Insight['category']) => {
    switch (category) {
      case 'identification':
        return <Users className="h-4 w-4" />;
      case 'need':
        return <Target className="h-4 w-4" />;
      case 'authority':
        return <Briefcase className="h-4 w-4" />;
      case 'budget':
        return <DollarSign className="h-4 w-4" />;
      case 'timeline':
        return <LineChart className="h-4 w-4" />;
      case 'qualification':
        return <PieChart className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Modified helper function to update form fields with flash effect and insights
  const updateFormField = useCallback((fieldId: string, newValue: string | boolean | null) => {
    const field = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!field) return;

    // Determine category based on field ID
    let category: Insight['category'] = 'system';
    if (fieldId.includes('contact') || fieldId.includes('company')) {
      category = 'identification';
    } else if (fieldId.includes('need') || fieldId.includes('problem')) {
      category = 'need';
    } else if (fieldId.includes('authority') || fieldId.includes('decision')) {
      category = 'authority';
    } else if (fieldId.includes('budget')) {
      category = 'budget';
    } else if (fieldId.includes('timeline') || fieldId.includes('purchase')) {
      category = 'timeline';
    } else if (fieldId.includes('bantFit') || fieldId.includes('nextStep')) {
      category = 'qualification';
    }

    // For checkboxes, handle boolean values
    if (field instanceof HTMLInputElement && field.type === 'checkbox') {
      if (typeof newValue === 'boolean') {
        const oldValue = field.checked;
        field.checked = newValue;
        field.classList.add('flash-highlight');
        setTimeout(() => field.classList.remove('flash-highlight'), 1500);
        
        // Add insight for checkbox changes
        if (oldValue !== newValue) {
          addInsight(
            'update',
            `${fieldId} status changed to ${newValue ? 'checked' : 'unchecked'}`,
            category,
            fieldId,
            newValue.toString()
          );
        }
        return;
      }
    }

    // For text inputs, textareas, and selects
    if (typeof newValue === 'string') {
      // Only update if the new value is non-empty or the field is empty
      if (newValue.trim() !== '' || field.value.trim() === '') {
        const oldValue = field.value;
        field.value = newValue;
        field.classList.add('flash-highlight');
        setTimeout(() => field.classList.remove('flash-highlight'), 1500);
        
        // Add insight for field updates
        if (oldValue !== newValue) {
          addInsight(
            'update',
            `${fieldId} updated with new value`,
            category,
            fieldId,
            newValue
          );
        }
      }
    }
  }, [addInsight]);

  // Define callback function for pattern matching
  function actionCallback(_match: string, _groups: any[]) {
    // Process sales buttons after the DOM updates
    setTimeout(() => {
      processSalesButtons(
        agentContextData,
        updateAgentContextData,
        setProspectName,
        setProspectEmail,
        setProspectCompany
      );
    }, 0);
  }

  // Callback when a response is complete: just updates history and flags for analysis
  const handleResponseComplete = useCallback((callId: string, prompt: string, response: string) => {
    console.log('Response complete, queuing history update:', { callId, prompt, response });

    const newHistoryEntry: ConversationMessage[] = [
      { role: 'user', content: prompt },
      { role: 'assistant', content: response }
    ];

    // Update history state
    setConversationHistory(prev => [...prev, ...newHistoryEntry]);

    // Set flag to trigger analysis in the useEffect hook
    shouldRunBantAnalysis.current = true;

  }, [setConversationHistory]); // Dependency: only the state setter

  // Effect to run BANT analysis when conversation history updates AND the flag is set
  useEffect(() => {
    if (shouldRunBantAnalysis.current && conversationHistory.length > 0) {
      shouldRunBantAnalysis.current = false;

      if (isProcessingBant) {
        console.log("BANT analysis already in progress. Skipping new request.");
        return;
      }

      console.log('Running BANT analysis due to history update.');
      setIsProcessingBant(true);

      try {
        const conversationToSend = JSON.stringify(conversationHistory, null, 2);
        console.log('Sending full conversation to BANT analysis:', conversationToSend);

        send(
          conversationToSend,
          [],
          [],
          false,
          true,
          bantExtractorAgentId,
          null,
          new AbortController(),
          (result: string) => {
            console.log("BANT analysis complete. Result:", result);
            try {
              // Clean the result string by removing markdown code block markers if present
              const cleanedResult = result.replace(/^```json\n?/, '').replace(/\n?```$/, '');
              const bantData = JSON.parse(cleanedResult);
              
              // Add initial insight about the analysis
              addInsight('insight', 'New BANT analysis completed from conversation', 'system', '', '');
              
              // Update form fields based on the BANT analysis
              // Identification
              updateFormField('contactName', bantData.contactName);
              updateFormField('companyName', bantData.companyName);
              updateFormField('contactEmail', bantData.contactEmail);
              
              // Need
              updateFormField('coreProblemMatch', bantData.coreProblemMatch);
              updateFormField('needSummary', bantData.needSummary);
              updateFormField('needNotes', bantData.needNotes);
              
              // Authority
              updateFormField('decisionRole', bantData.decisionRole);
              updateFormField('authorityNotes', bantData.authorityNotes);
              
              // Budget
              updateFormField('budgetIndication', bantData.budgetIndication);
              updateFormField('budgetNotes', bantData.budgetNotes);
              
              // Timeline
              updateFormField('purchaseTimeline', bantData.purchaseTimeline);
              updateFormField('timelineNotes', bantData.timelineNotes);
              
              // Qualification Outcome
              updateFormField('bantFit', bantData.bantFit);
              updateFormField('nextStep', bantData.nextStep);
              updateFormField('outcomeNotes', bantData.outcomeNotes);

              // Add insights for significant changes
              if (bantData.bantFit) {
                addInsight('insight', `BANT Fit Assessment: ${bantData.bantFit}`, 'qualification', 'bantFit', bantData.bantFit);
              }
              if (bantData.nextStep) {
                addInsight('insight', `Suggested Next Step: ${bantData.nextStep}`, 'qualification', 'nextStep', bantData.nextStep);
              }
              if (bantData.decisionRole) {
                addInsight('insight', `Decision Role Identified: ${bantData.decisionRole}`, 'authority', 'decisionRole', bantData.decisionRole);
              }
            } catch (parseError) {
              console.error('Error parsing BANT analysis result:', parseError);
              addInsight('insight', 'Error processing BANT analysis results', 'system', '', '');
            }
            setIsProcessingBant(false);
          },
          (err: string) => {
            console.error("BANT analysis error:", err);
            addInsight('insight', 'Error during BANT analysis', 'system', '', '');
            setIsProcessingBant(false);
          }
        );
      } catch (err) {
        console.error("Error initiating BANT analysis:", err);
        addInsight('insight', 'Error initiating BANT analysis', 'system', '', '');
        setIsProcessingBant(false);
      }
    }
  }, [conversationHistory, send, bantExtractorAgentId, setIsProcessingBant, isProcessingBant, updateFormField, addInsight]);

  // Define actions for the sales agent
  const salesActions = useMemo(() => [
    {
      pattern: "\\[\\[name:\\s*(.*?)\\s*,\\s*email:\\s*(.*?)\\s*,\\s*company:\\s*(.*?)\\s*\\]\\]",
      type: 'button',
      callback: actionCallback,
      markdown: '',  // Empty markdown to avoid showing any text
      style: 'sales-button'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [actionCallback]); // Include actionCallback as dependency

  // Update the agent context data when the component mounts
  useEffect(() => {
    if (!contextSetRef.current) {
      const salesContext = {
        company: companyDescription,
        valueProposition: valueProposition,
        product: productDescription,
        salesActions: salesActions,
        responseCompleteCallback: handleResponseComplete, // Pass the updated callback
        prospectName: '',
        prospectEmail: '',
        prospectCompany: ''
      };
      updateAgentContextData('sales', salesContext);
      contextSetRef.current = true;
    }
  }, [updateAgentContextData, salesActions, companyDescription, valueProposition, productDescription, handleResponseComplete]);

  // Effect for processing sales buttons dynamically
  useEffect(() => {
    processSalesButtons(
      agentContextData,
      updateAgentContextData,
      setProspectName,
      setProspectEmail,
      setProspectCompany
    );
    const interval = setInterval(() => {
      processSalesButtons(
        agentContextData,
        updateAgentContextData,
        setProspectName,
        setProspectEmail,
        setProspectCompany
      );
    }, 250);
    return () => clearInterval(interval);
  }, [agentContextData, updateAgentContextData, setProspectName, setProspectEmail, setProspectCompany]);

  // Add helper functions for demo modal styling
  const getSectionColor = (section: string) => {
    switch (section) {
      case 'identification':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      case 'need':
        return 'bg-green-50 border-green-100 text-green-600';
      case 'authority':
        return 'bg-purple-50 border-purple-100 text-purple-600';
      case 'budget':
        return 'bg-yellow-50 border-yellow-100 text-yellow-600';
      case 'timeline':
        return 'bg-orange-50 border-orange-100 text-orange-600';
      case 'qualification':
        return 'bg-red-50 border-red-100 text-red-600';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-600';
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'identification':
        return <Users className="h-4 w-4" />;
      case 'need':
        return <Target className="h-4 w-4" />;
      case 'authority':
        return <Briefcase className="h-4 w-4" />;
      case 'budget':
        return <DollarSign className="h-4 w-4" />;
      case 'timeline':
        return <LineChart className="h-4 w-4" />;
      case 'qualification':
        return <PieChart className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'sales' | 'bant' | 'context'>('sales');

  return (
    <div className="h-full flex flex-col">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowWelcomeModal(false)}>
          <div 
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Welcome to the Sales Assistant Demo</h2>
                    <p className="text-sm text-gray-600">Powered by LLMasaService</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Experience AI-Powered Sales Qualification</h3>
                <p className="text-gray-700 mb-4">
                  This demo showcases how LLMasaService can transform your sales process through conversational AI. The Sales Assistant uses natural language processing to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Conduct intelligent BANT qualification in real-time</li>
                  <li>Analyze conversations for key insights and opportunities</li>
                  <li>Automatically populate CRM fields based on natural dialogue</li>
                  <li>Provide immediate feedback and suggestions</li>
                </ul>

                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Try it out:</h4>
                  <ol className="list-decimal pl-6 space-y-2 text-sm text-blue-700">
                    <li>Start a conversation with the AI assistant</li>
                    <li>Share details about your company's needs and challenges</li>
                    <li>Watch as the BANT form automatically updates</li>
                    <li>Check the real-time insights panel for analysis</li>
                    <li>Try asking about pricing, features, or next steps</li>
                  </ol>
                </div>

                <div className="mt-6 bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">About LLMasaService</h4>
                  <p className="text-sm text-gray-700">
                    LLMasaService provides enterprise-grade AI solutions that integrate seamlessly with your existing workflows. This demo is just one example of how our platform can enhance your business processes through intelligent automation and natural language understanding.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Start Demo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-gray-200 bg-white">
        <BackNavigation />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Sales Assistant</h1>
              <p className="text-gray-600">Your AI-powered sales optimization companion</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowInstructionsModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Show AI Agent Instructions
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="flex max-w-7xl mx-auto gap-6">
          {/* Left Column - Context Information (1/4 width) */}
          <div className="w-1/4">
            {/* Sample Data Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <div className="text-amber-500 mt-1 flex-shrink-0">
                <Info size={16} />
              </div>
              <div>
                <h3 className="font-medium text-amber-800 mb-1 text-sm">Example Data</h3>
                <p className="text-xs text-amber-700">
                  This is fictional sample content to demonstrate how the AI will use company and product information to engage with prospects.
                </p>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Tab Navigation */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex space-x-1">
                <button
                  onClick={() => setActiveTab('company')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'company'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Company
                </button>
                <button
                  onClick={() => setActiveTab('value')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'value'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Value Prop
                </button>
                <button
                  onClick={() => setActiveTab('product')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'product'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Product
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 overflow-auto max-h-[calc(100vh-280px)]">
                <div className="prose prose-sm max-w-none">
                  {activeTab === 'company' && (
                    <ReactMarkdown>{companyDescription}</ReactMarkdown>
                  )}
                  {activeTab === 'value' && (
                    <ReactMarkdown>{valueProposition}</ReactMarkdown>
                  )}
                  {activeTab === 'product' && (
                    <ReactMarkdown>{productDescription}</ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Lead Qualification Form (1/2 width) */}
          <div className="w-1/2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Clipboard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Lead Qualification</h2>
                    <p className="text-sm text-gray-600">BANT Assessment</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-100/50 border border-blue-100 rounded-lg p-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>Real-time insights from the sales conversation will appear here</p>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Two-column layout for the form */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Identification and Need */}
                  <div className="space-y-6">
                    {/* Identification Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">1. Identification</h3>
                      
                      <div className="grid gap-3">
                        <div>
                          <label htmlFor="contactName" className="block text-xs font-medium text-gray-700 mb-1">Contact Name</label>
                          <input 
                            type="text" 
                            id="contactName" 
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="companyName" className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                          <input 
                            type="text" 
                            id="companyName" 
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="contactEmail" className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                          <input 
                            type="email" 
                            id="contactEmail" 
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Need Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">2. Need (N)</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="coreProblemMatch"
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor="coreProblemMatch" className="text-xs font-medium text-gray-700">Core Problem Match?</label>
                            <p className="text-xs text-gray-500">Check if prospect expressed significant pain related to manual CRM data entry, time waste, or low adoption.</p>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="needSummary" className="block text-xs font-medium text-gray-700 mb-1">Need Summary</label>
                          <textarea 
                            id="needSummary" 
                            rows={2}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Briefly describe their primary goal or pain point in 1-2 sentences"
                          ></textarea>
                        </div>
                        
                        <div>
                          <label htmlFor="needNotes" className="block text-xs font-medium text-gray-700 mb-1">Notes on Need</label>
                          <textarea 
                            id="needNotes" 
                            rows={2}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Additional context about their needs"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* Authority Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">3. Authority (A)</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="decisionRole" className="block text-xs font-medium text-gray-700 mb-1">Decision Role</label>
                          <select 
                            id="decisionRole" 
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a role...</option>
                            <option value="decisionMaker">Decision Maker</option>
                            <option value="influencer">Influencer / Recommender</option>
                            <option value="user">User / Researcher</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="authorityNotes" className="block text-xs font-medium text-gray-700 mb-1">Notes on Authority</label>
                          <textarea 
                            id="authorityNotes" 
                            rows={2}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Relevant details about decision making process"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Budget, Timeline, and Qualification */}
                  <div className="space-y-6">
                    {/* Budget Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">4. Budget (B)</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="budgetIndication" className="block text-xs font-medium text-gray-700 mb-1">Budget Indication</label>
                          <select 
                            id="budgetIndication" 
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select budget status...</option>
                            <option value="confirmed">Budget Likely/Confirmed</option>
                            <option value="exploring">Exploring / Possible</option>
                            <option value="unlikely">Budget Unlikely / None</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="budgetNotes" className="block text-xs font-medium text-gray-700 mb-1">Notes on Budget</label>
                          <textarea 
                            id="budgetNotes" 
                            rows={2}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Specific budget information or constraints"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">5. Timeline (T)</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="purchaseTimeline" className="block text-xs font-medium text-gray-700 mb-1">Purchase Timeline</label>
                          <select 
                            id="purchaseTimeline" 
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select timeline...</option>
                            <option value="lt3months">{"< 3 Months"}</option>
                            <option value="3-6months">3-6 Months</option>
                            <option value="gt6months">6+ Months</option>
                            <option value="researching">Researching Only / Undefined</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="timelineNotes" className="block text-xs font-medium text-gray-700 mb-1">Notes on Timeline</label>
                          <textarea 
                            id="timelineNotes" 
                            rows={2}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Specific timing factors, deadlines, or events"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* Qualification Outcome Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">6. Qualification Outcome</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="bantFit" className="block text-xs font-medium text-gray-700 mb-1">Overall BANT Fit</label>
                          <select 
                            id="bantFit" 
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select fit assessment...</option>
                            <option value="strongFit">Strong Fit (Qualified)</option>
                            <option value="potentialFit">Potential Fit (Nurture)</option>
                            <option value="poorFit">Poor Fit (Disqualified)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="nextStep" className="block text-xs font-medium text-gray-700 mb-1">Suggested Next Step</label>
                          <input 
                            type="text" 
                            id="nextStep" 
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Schedule Demo, Send Pricing, etc."
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="outcomeNotes" className="block text-xs font-medium text-gray-700 mb-1">Additional Notes</label>
                          <textarea 
                            id="outcomeNotes" 
                            rows={2}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Any other relevant information for qualification"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button - Full Width */}
                <div className="pt-2">
                  <button 
                    onClick={() => setShowDemoModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Save Lead Qualification
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Real Time Insights (1/4 width) */}
          <div className="w-1/4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-purple-50 border-b border-purple-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <LineChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Real Time Insights</h2>
                    <p className="text-sm text-gray-600">Key updates and analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setInsights([])}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title="Clear insights"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {insights.map((insight) => (
                    <div 
                      key={insight.id}
                      className={`p-3 rounded-lg border ${getCategoryColor(insight.category)}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`p-1 rounded ${getCategoryColor(insight.category)}`}>
                          {getCategoryIcon(insight.category)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{insight.message}</p>
                          {insight.field && insight.value && (
                            <p className="text-xs text-gray-500 mt-1">
                              Field: {insight.field} | Value: {insight.value}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {insight.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {insights.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No insights yet. Start a conversation to see key updates. Try using the suggested prompt buttons to start:
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Clipboard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Demo: Lead Qualification Data</h2>
                    <p className="text-sm text-gray-600">This is a demo showing the captured form data</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Identification Section */}
                  <div className={`p-4 rounded-lg border ${getSectionColor('identification')}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1 rounded ${getSectionColor('identification')}`}>
                        {getSectionIcon('identification')}
                      </div>
                      <h3 className="text-sm font-medium">1. Identification</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Contact Name</label>
                        <div className="text-sm text-gray-900">{getFormData().contactName || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Company Name</label>
                        <div className="text-sm text-gray-900">{getFormData().companyName || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Contact Email</label>
                        <div className="text-sm text-gray-900">{getFormData().contactEmail || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Need Section */}
                  <div className={`p-4 rounded-lg border ${getSectionColor('need')}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1 rounded ${getSectionColor('need')}`}>
                        {getSectionIcon('need')}
                      </div>
                      <h3 className="text-sm font-medium">2. Need (N)</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                          getFormData().coreProblemMatch ? 'bg-green-100 border-green-200' : 'bg-gray-100 border-gray-200'
                        }`}>
                          {getFormData().coreProblemMatch && <Check className="h-3 w-3 text-green-600" />}
                        </div>
                        <span className="text-sm text-gray-900">Core Problem Match</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Need Summary</label>
                        <div className="text-sm text-gray-900">{getFormData().needSummary || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Notes on Need</label>
                        <div className="text-sm text-gray-900">{getFormData().needNotes || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Authority Section */}
                  <div className={`p-4 rounded-lg border ${getSectionColor('authority')}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1 rounded ${getSectionColor('authority')}`}>
                        {getSectionIcon('authority')}
                      </div>
                      <h3 className="text-sm font-medium">3. Authority (A)</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Decision Role</label>
                        <div className="text-sm text-gray-900">{getFormData().decisionRole || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Notes on Authority</label>
                        <div className="text-sm text-gray-900">{getFormData().authorityNotes || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Budget Section */}
                  <div className={`p-4 rounded-lg border ${getSectionColor('budget')}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1 rounded ${getSectionColor('budget')}`}>
                        {getSectionIcon('budget')}
                      </div>
                      <h3 className="text-sm font-medium">4. Budget (B)</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Budget Indication</label>
                        <div className="text-sm text-gray-900">{getFormData().budgetIndication || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Notes on Budget</label>
                        <div className="text-sm text-gray-900">{getFormData().budgetNotes || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className={`p-4 rounded-lg border ${getSectionColor('timeline')}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1 rounded ${getSectionColor('timeline')}`}>
                        {getSectionIcon('timeline')}
                      </div>
                      <h3 className="text-sm font-medium">5. Timeline (T)</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Purchase Timeline</label>
                        <div className="text-sm text-gray-900">{getFormData().purchaseTimeline || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Notes on Timeline</label>
                        <div className="text-sm text-gray-900">{getFormData().timelineNotes || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Qualification Outcome Section */}
                  <div className={`p-4 rounded-lg border ${getSectionColor('qualification')}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1 rounded ${getSectionColor('qualification')}`}>
                        {getSectionIcon('qualification')}
                      </div>
                      <h3 className="text-sm font-medium">6. Qualification Outcome</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Overall BANT Fit</label>
                        <div className="text-sm text-gray-900">{getFormData().bantFit || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Suggested Next Step</label>
                        <div className="text-sm text-gray-900">{getFormData().nextStep || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Additional Notes</label>
                        <div className="text-sm text-gray-900">{getFormData().outcomeNotes || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 mt-1 flex-shrink-0">
                      <Info size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1 text-sm">Demo Information</h3>
                      <p className="text-xs text-blue-700">
                        This is a demo showing the captured form data. In a real application, this data would be saved to a database and integrated with your CRM system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Agent Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowInstructionsModal(false)}>
          <div 
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">AI Agent Instructions</h2>
                    <p className="text-sm text-gray-600">View instructions and context for AI agents</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveInstructionTab('sales')}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeInstructionTab === 'sales'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activeInstructionTab === 'sales'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600'
                  }`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Sales Assistant</p>
                    <p className={`text-xs ${
                      activeInstructionTab === 'sales' ? 'text-blue-100' : 'text-gray-500'
                    }`}>Core agent instructions</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveInstructionTab('bant')}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeInstructionTab === 'bant'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activeInstructionTab === 'bant'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-600'
                  }`}>
                    <Clipboard className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">BANT Extractor</p>
                    <p className={`text-xs ${
                      activeInstructionTab === 'bant' ? 'text-green-100' : 'text-gray-500'
                    }`}>Data extraction agent</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveInstructionTab('context')}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeInstructionTab === 'context'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activeInstructionTab === 'context'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-600'
                  }`}>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Context Data</p>
                    <p className={`text-xs ${
                      activeInstructionTab === 'context' ? 'text-purple-100' : 'text-gray-500'
                    }`}>Agent configuration</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Content Separator */}
            <div className="border-b border-gray-200 mt-2"></div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {activeInstructionTab === 'sales' && (
                <div className="prose prose-sm max-w-none">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">🟣 AI Agent Instructions — ConverseAI CRM Lead Qualification Chatbot</h2>

                  <div className="space-y-6">
                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">1️⃣ Core Directive — Stateful Qualification</h3>
                      <div className="pl-4">
                        <p className="font-medium mb-2">Primary Goal:</p>
                        <p className="mb-4">Qualify leads (BANT) via structured Q&A, while rigorously maintaining and referencing conversation state to avoid repetition and demonstrate understanding.</p>
                        
                        <p className="font-medium mb-2">Extractor & State Manager:</p>
                        <p>Your role is to:</p>
                        <ul className="list-disc pl-6 mb-4">
                          <li>Ask targeted questions</li>
                          <li>Constantly update and check your internal state:
                            <ul className="list-disc pl-6 mt-2">
                              <li>Need</li>
                              <li>Authority</li>
                              <li>Budget Context</li>
                              <li>Timeline</li>
                              <li>Tools</li>
                              <li>Contact Info</li>
                            </ul>
                          </li>
                        </ul>
                        <p className="font-medium">ABQ (Always Be Qualifying — Intelligently):</p>
                        <p>Progressively advance qualification based on known vs. unknown information.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">2️⃣ Persona & Tone</h3>
                      <div className="pl-4">
                        <p className="font-medium mb-2">Attentive Qualifier:</p>
                        <p>Professional, efficient, concise — yet clearly attentive to what has already been said.</p>
                        
                        <p className="font-medium mt-4 mb-2">Adaptive (within structure):</p>
                        <p>Maintain structured Q&A format, but adapt based on feedback and accumulated state.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">3️⃣ Non-Negotiable Core Mechanics & Rules</h3>
                      
                      <div className="pl-4 space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Rule #1 — ✅ Anti-Repetition State Check</h4>
                          <p className="mb-2">Before generating ANY question, internally check:</p>
                          <p className="italic mb-2">"Based on ALL previous turns, is the core information this question seeks (or something strongly implying it) ALREADY ESTABLISHED?"</p>
                          <p className="mb-2">If YES → DO NOT ASK.</p>
                          <p className="mb-2">Immediately select a question targeting a clearly UNKNOWN BANT aspect.</p>
                          <p className="font-medium mb-2">Never re-ask about:</p>
                          <ul className="list-disc pl-6">
                            <li>Core Pain Points (once detailed)</li>
                            <li>Timelines (once clear)</li>
                            <li>Authority (once role is known)</li>
                            <li>Evaluation process (once described)</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Rule #2 — ✅ Early Info Capture</h4>
                          <p className="mb-2">Within the first 3-4 exchanges, if Name, Email, or Company are unknown, ask:</p>
                          <p className="italic bg-gray-50 p-2 rounded">"Thanks for sharing that. To make sure we can follow up correctly, may I quickly get your name, email, and company?"</p>
                          <p className="mt-2">Then, immediately continue with the next relevant qualifying question.</p>
                          
                          <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="font-medium text-blue-700 mb-1">Contact Information Collected So far:</p>
                            <p className="text-blue-600 text-sm">Name: {'{{prospectName}}'}</p>
                            <p className="text-blue-600 text-sm">Email: {'{{prospectEmail}}'}</p>
                            <p className="text-blue-600 text-sm">Company: {'{{prospectCompany}}'}</p>
                            <p className="text-blue-600 text-sm mt-2">If we have values for these, don't ask for them again.</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Rule #3 — ✅ One Question Mark Per Response</h4>
                          <p>Strictly limit yourself to ONE question mark per response.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Rule #4 — ✅ Default Format</h4>
                          <p className="mb-2">Each response MUST follow:</p>
                          <ul className="list-disc pl-6">
                            <li>[Concise Acknowledgment]</li>
                            <li>[ONE state-checked, non-repetitive, open-ended qualifying question (ends with ?)]</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Rule #5 — ✅ Infer & Advance</h4>
                          <p className="mb-2">If the user implies another BANT element:</p>
                          <p className="italic mb-2">(e.g., contract date → timeline, CEO → authority, "must have it" → budget priority)</p>
                          <p>Update state and move on — do not explicitly confirm.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Rule #6 — ✅ No Paragraphs / Extreme Brevity</h4>
                          <p>Use short, structured responses only.</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">4️⃣ Controlled Exceptions & Recovery Mechanisms</h3>
                      
                      <div className="pl-4 space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Exception A — Handling Direct Questions</h4>
                          <p className="font-medium mb-2">About Product:</p>
                          <p className="mb-2">[Acknowledge] → [Micro-Summary] → [Pivot to qualifying question about their need/context]</p>
                          
                          <p className="font-medium mt-4 mb-2">About Capability:</p>
                          <p>Respond directly and honestly (e.g., "I can't personally show demos, but I can arrange one.")</p>
                          <p>Then immediately ask the next relevant, non-repetitive qualifying question.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Exception B — Conditional Summarization (Recovery Tool)</h4>
                          <p className="font-medium mb-2">Trigger:</p>
                          <ul className="list-disc pl-6 mb-2">
                            <li>User explicitly asks for a recap</li>
                            <li>OR expresses significant confusion/frustration multiple times</li>
                          </ul>
                          
                          <p className="font-medium mb-2">Action:</p>
                          <ul className="list-disc pl-6 mb-2">
                            <li>Provide a complete BANT + context summary (2–4 sentences MAX)</li>
                          </ul>
                          
                          <p className="font-medium mb-2">Follow-up:</p>
                          <ul className="list-disc pl-6">
                            <li>Ask: "Does that accurately summarize our conversation so far?"</li>
                            <li>Wait for confirmation before asking the next question.</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Exception C — Handling User Feedback (Mandatory Adaptation)</h4>
                          <p className="font-medium mb-2">Trigger:</p>
                          <ul className="list-disc pl-6 mb-2">
                            <li>User gives negative feedback (e.g., repetitive, obtuse, tactless)</li>
                          </ul>
                          
                          <p className="font-medium mb-2">Action:</p>
                          <ul className="list-disc pl-6 mb-2">
                            <li>Apologize sincerely</li>
                            <li>State the specific correction you'll make:
                              <ul className="list-disc pl-6 mt-2">
                                <li>"I'll ensure I focus only on new topics going forward."</li>
                                <li>"Understood, I'll adjust my approach."</li>
                              </ul>
                            </li>
                          </ul>
                          
                          <p className="font-medium mb-2">Follow-up:</p>
                          <ul className="list-disc pl-6">
                            <li>Next question MUST demonstrate adaptation:
                              <ul className="list-disc pl-6 mt-2">
                                <li>Avoid repetition</li>
                                <li>Use softer phrasing if needed</li>
                                <li>Offer a summary if appropriate (see Exception B)</li>
                              </ul>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">5️⃣ Information Gathering Strategy — State-Driven BANT</h3>
                      <div className="pl-4">
                        <p className="font-medium mb-2">Actively maintain:</p>
                        <ul className="list-disc pl-6 mb-4">
                          <li>Name</li>
                          <li>Company</li>
                          <li>Email</li>
                          <li>Need (Pains, Goals)</li>
                          <li>Authority (Role, Evaluation Process)</li>
                          <li>Budget (Context, Priority, Intent)</li>
                          <li>Timeline (Trigger, Date)</li>
                          <li>Current Tools</li>
                        </ul>
                        <p className="font-medium">Target the UNKNOWN</p>
                        <p>Explicitly check state before every question to focus only on missing pieces.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">6️⃣ Tactful Phrasing (Guidance)</h3>
                      <div className="pl-4">
                        <p className="mb-2">Ask about Authority/Budget later in the conversation when appropriate.</p>
                        <ul className="list-disc pl-6">
                          <li>Softer Authority:
                            <p className="italic ml-6">"What does the evaluation process typically involve?"</p>
                          </li>
                          <li>Softer Budget:
                            <p className="italic ml-6">"How does your team prioritize investments for tools that boost productivity?"</p>
                          </li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">7️⃣ Driving Towards Next Step</h3>
                      <div className="pl-4">
                        <p className="font-medium mb-2">Only offer a demo or call when:</p>
                        <ul className="list-disc pl-6 mb-4">
                          <li>Need, Authority, Timeline are reasonably clear</li>
                          <li>Budget context is plausible</li>
                          <li>User is not actively frustrated</li>
                        </ul>
                        
                        <p className="font-medium mb-2">Tailor the offer to show synthesized understanding.</p>
                        <p className="italic bg-gray-50 p-2 rounded">Example:</p>
                        <p className="italic ml-4">{"Okay <Name>, understanding you're the CEO, your <Other CRM> contract is up in 3 months, and the key goal is eliminating that 4-10 hrs/week of data entry — would a brief demo focused specifically on how our AI handles that automation be a productive next step?"}</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">8️⃣ Company, Value Proposition, and Product Description</h3>
                      <div className="pl-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3">
                          <p className="font-medium mb-2">The Company:</p>
                          <p className="text-sm text-gray-700">{'{{company}}'}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3">
                          <p className="font-medium mb-2">The Value Proposition:</p>
                          <p className="text-sm text-gray-700">{'{{valueProposition}}'}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3">
                          <p className="font-medium mb-2">The Product:</p>
                          <p className="text-sm text-gray-700">{'{{product}}'}</p>
                        </div>
                        
                        <p className="mt-3">Use this to answer product-related questions, but strictly follow the mission and style rules above.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">9️⃣ Special Formatting Rule</h3>
                      <div className="pl-4">
                        <p className="mb-2">When asking for Name, Email, and Company —</p>
                        <p className="font-medium mb-2">MUST use this exact syntax:</p>
                        <p className="font-mono bg-gray-50 p-2 rounded">{"[[name: <entername>, email: <enteremail>, company: <entercompany>]]"}</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">1️⃣0️⃣ Final Formatting / Style Notes</h3>
                      <div className="pl-4">
                        <p className="font-mono bg-gray-50 p-2 rounded">{"{{formatting}}"}</p>
                      </div>
                    </section>
                  </div>
                </div>
              )}
              
              {activeInstructionTab === 'bant' && (
                <div className="prose prose-sm max-w-none">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">🟣 System Instructions: BANT Extractor Agent</h2>
                  <p className="text-sm text-gray-600 mb-6">(V1 — JSON Extraction Specialist)</p>

                  <div className="space-y-6">
                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">1️⃣ Role</h3>
                      <div className="pl-4">
                        <p>You are an AI assistant specialized in analyzing sales conversations.</p>
                        <p className="font-medium mt-2">Your sole purpose is to extract key qualification information:</p>
                        <p className="font-mono bg-gray-50 p-2 rounded mt-2">BANT = Budget, Authority, Need, Timeline</p>
                        <p className="mt-2">Extract these and related details from a conversation transcript between an LLM agent and a human prospect.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">2️⃣ Input</h3>
                      <div className="pl-4">
                        <p className="font-medium mb-2">You will receive:</p>
                        <p className="font-mono bg-gray-50 p-2 rounded">→ a transcript of a sales qualification conversation</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">3️⃣ Core Task</h3>
                      <div className="pl-4">
                        <p>Analyze the entire transcript.</p>
                        <p>For each required field, synthesize information and populate the target JSON object.</p>
                        <p>Use predefined option lists when provided.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">4️⃣ Output Requirements</h3>
                      <div className="pl-4 space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">JSON ONLY</h4>
                          <p>Output must be ONLY a valid JSON object.</p>
                          <p className="text-red-600">⚠️ No pre-text, post-text, explanations, or stray characters.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Exact JSON Structure</h4>
                          <p>Strictly follow the specified fields, field names, and data types.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Use Enumerated Values</h4>
                          <p>For fields with options, select from the exact (case-sensitive) list.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Handling Missing Information</h4>
                          <ul className="list-disc pl-6">
                            <li>For string fields: if unknown, use null</li>
                            <li>coreProblemMatch: default to false if unknown</li>
                            <li>decisionRole: best inference; default "user" if ambiguous</li>
                            <li>budgetIndication: default "unknown"</li>
                            <li>purchaseTimeline: default "researching"</li>
                            <li>bantFit: default "potentialFit"</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">5️⃣ Target JSON Structure & Extraction Logic</h3>
                      <div className="pl-4">
                        <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto border border-gray-100 text-gray-700">
{`{
  "contactName": "...",             // string | Full name of prospect | null if missing
  "companyName": "...",             // string | Company name | null if missing
  "contactEmail": "...",            // string | Email address | null if missing
  "coreProblemMatch": ...,          // boolean | True if prospect expresses significant pain about: manual CRM data entry, excessive CRM admin work, low CRM adoption, or similar
  "needSummary": "...",             // string | 1-sentence primary need summary | null if no clear need
  "needNotes": "...",               // string | Supporting need details, examples, goals, or pain points | null if none
  "decisionRole": "...",            // enum | Options: "decisionMaker", "influencer", "user" | default "user" if ambiguous
  "authorityNotes": "...",          // string | Evidence for decisionRole (titles, quotes, context) | null if none
  "budgetIndication": "...",        // enum | Options: "confirmed", "exploring", "unlikely", "unknown" | default "unknown"
  "budgetNotes": "...",             // string | Supporting budget details | null if none
  "purchaseTimeline": "...",        // enum | Options: "lt3months", "3-6months", "gt6months", "researching" | default "researching"
  "timelineNotes": "...",           // string | Supporting timeline details | null if none
  "bantFit": "...",                 // enum | Options: "strongFit", "potentialFit", "poorFit" | default "potentialFit"
  "nextStep": "...",                // string | Next agreed/proposed action | null if none
  "outcomeNotes": "..."             // string | Brief lead summary, context, or follow-up notes | null if none
}`}
                        </pre>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">6️⃣ Final Check</h3>
                      <div className="pl-4">
                        <p className="font-medium mb-2">Before you output:</p>
                        <ul className="list-disc pl-6">
                          <li>✔ Validate the JSON</li>
                          <li>✔ Confirm it strictly matches these instructions</li>
                          <li>✔ Ensure only the JSON object is returned</li>
                        </ul>
                      </div>
                    </section>
                  </div>
                </div>
              )}
              
              {activeInstructionTab === 'context' && (
                <div className="space-y-4">
                  {Object.entries(agentContextData['sales'] || {}).map(([key, value]) => (
                    <div key={key} className="border border-indigo-100 rounded-lg p-4 bg-white bg-opacity-80">
                      <h4 className="font-medium text-indigo-800 mb-2 text-sm uppercase tracking-wider flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                        {key}
                      </h4>
                      <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-60 border border-gray-100 text-gray-700">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 