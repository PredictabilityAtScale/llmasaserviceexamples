import { ArrowRight, UserPlus } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { Sales } from './Sales';
import { Onboarding } from './Onboarding';
import ExampleForm from './examples/ExampleForm';
import { useCallback, useMemo, useEffect } from 'react';
import md5 from 'md5';

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
    
    // Create company input
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

// Helper function to process options buttons
const processOptionsButtons = (
  agentContextData: any,
  updateAgentContextData: (agentId: string, data: any) => void,
) => {
  // Find all elements with the options-button class
  const optionsButtons = document.querySelectorAll('.options-button');
  
  optionsButtons.forEach((button) => {
    // Skip if already processed
    if (button.classList.contains('options-button-processed')) return;
    
    // Mark as processed
    button.classList.add('options-button-processed');
    
    // Get the existing content which is already processed by the regex
    const content = button.textContent || '';
    const [title, optionsString] = content.split(':').map(s => s.trim());
    const options = optionsString.split(',').map(opt => opt.trim());
    
    // Clear the button's content
    button.innerHTML = '';
    
    // Create a title element
    const titleElement = document.createElement('div');
    titleElement.className = 'title';
    titleElement.textContent = title;
    button.appendChild(titleElement);
    
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    // Create radio buttons for each option
    options.forEach((option, index) => {
      const optionContainer = document.createElement('div');
      optionContainer.className = 'option';
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'option';
      radio.id = `option-${index}`;
      radio.value = option;
      
      const label = document.createElement('label');
      label.htmlFor = `option-${index}`;
      label.textContent = option;
      
      optionContainer.appendChild(radio);
      optionContainer.appendChild(label);
      optionsContainer.appendChild(optionContainer);
    });
    
    button.appendChild(optionsContainer);
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'submit-button';
    submitButton.textContent = 'Submit Selection';
    
    // Add event listener to the submit button
    submitButton.addEventListener('click', () => {
      const selectedOption = (button.querySelector('input[name="option"]:checked') as HTMLInputElement)?.value;
      
      if (selectedOption) {
        // Update agent context data with the selected option
        const currentContext = { ...agentContextData['llmaserviceinfo'] };
        currentContext.selectedOption = selectedOption;
        updateAgentContextData('llmaserviceinfo', currentContext);
        
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
        successText.textContent = `Selected: ${selectedOption}`;
        successMessage.appendChild(successText);
        
        // Append the success message to the button container
        button.appendChild(successMessage);
        
        // Set the follow-on prompt using the global event dispatcher
        const event = new CustomEvent('set-follow-on-prompt', { 
          detail: { agentId: 'llmaserviceinfo', prompt: `I selected: ${selectedOption}` } 
        });
        window.dispatchEvent(event);
      }
    });
    
    button.appendChild(submitButton);
  });
};

// Helper function to process task buttons
const processTaskButtons = () => {
  // Find all elements with the task-button class
  const taskButtons = document.querySelectorAll('.task-button');
  
  taskButtons.forEach((button) => {
    // Skip if already processed
    if (button.classList.contains('task-button-processed')) return;
    
    // Mark as processed
    button.classList.add('task-button-processed');
    
    // Get the existing content which is already processed by the regex
    const content = button.textContent || '';
    const [task, assignedTo] = content.split('|').map(s => s.trim());
    
    // Clear the button's content
    button.innerHTML = '';
    
    // Create task container
    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-title';
    
    // Create task label
    const taskLabel = document.createElement('span');
    taskLabel.className = 'task-label';
    taskLabel.textContent = 'Task:';
    taskContainer.appendChild(taskLabel);
    
    // Create task value
    const taskValue = document.createElement('span');
    taskValue.textContent = task;
    taskContainer.appendChild(taskValue);
    
    // Create assigned to container
    const assignedToContainer = document.createElement('div');
    assignedToContainer.className = 'assigned-to';
    
    // Create assigned to label
    const assignedToLabel = document.createElement('span');
    assignedToLabel.className = 'assigned-to-label';
    assignedToLabel.textContent = 'Assigned To:';
    assignedToContainer.appendChild(assignedToLabel);
    
    // Create assigned to value
    const assignedToValue = document.createElement('span');
    assignedToValue.textContent = assignedTo;
    assignedToContainer.appendChild(assignedToValue);
    
    // Create Gravatar image
    const gravatarImg = document.createElement('img');
    gravatarImg.className = 'w-6 h-6 rounded-full ml-1';
    gravatarImg.alt = 'Gravatar';
    gravatarImg.src = `https://www.gravatar.com/avatar/${md5(assignedTo.trim().toLowerCase())}?s=48&d=mp`;
    assignedToContainer.appendChild(gravatarImg);
    
    // Append elements to button
    button.appendChild(taskContainer);
    button.appendChild(assignedToContainer);

    // Add click handler to transform the button
    button.addEventListener('click', () => {
      // Clear the button's content
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
      successText.textContent = 'Task Added';
      successMessage.appendChild(successText);
      
      // Append the success message to the button container
      button.appendChild(successMessage);

      // Set the follow-on prompt using the global event dispatcher
      const event = new CustomEvent('set-follow-on-prompt', { 
        detail: { agentId: 'llmaserviceinfo', prompt: 'Task added successfully' } 
      });
      window.dispatchEvent(event);
    });
  });
};

export function Main() {
  const { activeAgent, setActiveAgent, updateAgentContextData, agentContextData } = useAgent();

  // Define callback function for pattern matching
  const actionCallback = useCallback((_match: string, _groups: any[]) => {
    // Process both sales and form context elements after the DOM updates
    setTimeout(() => {
      // Process sales buttons if they exist
      const salesButtons = document.querySelectorAll('.sales-button:not(.sales-button-processed)');
      if (salesButtons.length > 0) {
        // Update prospect information in the context
        const currentSalesContext = { ...agentContextData['sales'] };
        currentSalesContext.prospectName = _groups[0] || '';
        currentSalesContext.prospectEmail = _groups[1] || '';
        currentSalesContext.prospectCompany = _groups[2] || '';
        updateAgentContextData('sales', currentSalesContext);
      }

      // Process form context elements if they exist
      const formContextElements = document.querySelectorAll('.form-context:not(.form-context-processed)');
      if (formContextElements.length > 0) {
        // Update form context in the context
        const currentOnboardingContext = { ...agentContextData['onboarding'] };
        const path = _groups[0];
        const value = _groups[1];
        if (path && value) {
          // Update the form context with the new value
          const pathParts = path.split('.');
          if (pathParts.length >= 2) {
            const section = pathParts[0];
            const field = pathParts[1];
            if (currentOnboardingContext.formContext && currentOnboardingContext.formContext[section]) {
              currentOnboardingContext.formContext[section][field] = value;
              updateAgentContextData('onboarding', currentOnboardingContext);
            }
          }
        }
      }
    }, 100);
  }, [agentContextData, updateAgentContextData]);

  // Define actions for the demo agent - use useMemo to prevent recreation on every render
  const demoActions = useMemo(() => [
    // Sales action pattern
    {
      pattern: "\\[\\[name:\\s*(.*?)\\s*,\\s*email:\\s*(.*?)\\s*,\\s*company:\\s*(.*?)\\s*\\]\\]",
      type: 'button',
      callback: actionCallback,
      markdown: '',  // Empty markdown to avoid showing any text
      style: 'sales-button'
    },
    // Onboarding action pattern
    {
      pattern: "\\[\\[formContext:\\s*([\\w\\.]+)\\s*\\|\\s*([\\s\\S]*?)\\]\\]\\]?",
      type: 'button',
      callback: actionCallback,
      markdown: '$1: $2',  
      style: 'form-context',
      flags: "gm"  // Add flags separately
    },
    // Options action pattern
    {
      pattern: "\\[\\[survey Title:\\s*(.*?)\\s*\\|\\s*Options:\\s*(.*?)\\s*\\]\\]",
      type: 'button',
      callback: actionCallback,
      markdown: '$1: $2',  
      style: 'options-button',
      flags: "gm"  // Add flags separately
    },
     // Task action pattern
     {
      pattern: "\\[\\[task:\\s*([^|]+)\\s*\\|\\s*Assigned To:\\s*([^\\]]+)\\s*\\]\\]",
      type: 'button',
      callback: actionCallback,
      markdown: '$1|$2',  
      style: 'task-button',
      flags: "gm"  // Add flags separately
    }
  ], [actionCallback]);
  
  // Update agent context with demo actions
  useEffect(() => {
    updateAgentContextData('llmaserviceinfo', { 
      demoActions 
    });
  }, [updateAgentContextData, demoActions]);

  // Effect for processing sales buttons dynamically
  useEffect(() => {
    processSalesButtons(
      agentContextData,
      updateAgentContextData,
      (name) => {
        const currentSalesContext = { ...agentContextData['sales'] };
        currentSalesContext.prospectName = name;
        updateAgentContextData('sales', currentSalesContext);
      },
      (email) => {
        const currentSalesContext = { ...agentContextData['sales'] };
        currentSalesContext.prospectEmail = email;
        updateAgentContextData('sales', currentSalesContext);
      },
      (company) => {
        const currentSalesContext = { ...agentContextData['sales'] };
        currentSalesContext.prospectCompany = company;
        updateAgentContextData('sales', currentSalesContext);
      }
    );
    
    const interval = setInterval(() => {
      processSalesButtons(
        agentContextData,
        updateAgentContextData,
        (name) => {
          const currentSalesContext = { ...agentContextData['sales'] };
          currentSalesContext.prospectName = name;
          updateAgentContextData('sales', currentSalesContext);
        },
        (email) => {
          const currentSalesContext = { ...agentContextData['sales'] };
          currentSalesContext.prospectEmail = email;
          updateAgentContextData('sales', currentSalesContext);
        },
        (company) => {
          const currentSalesContext = { ...agentContextData['sales'] };
          currentSalesContext.prospectCompany = company;
          updateAgentContextData('sales', currentSalesContext);
        }
      );
    }, 250);
    
    return () => clearInterval(interval);
  }, [agentContextData, updateAgentContextData]);

  // Effect for processing options buttons dynamically
  useEffect(() => {
    processOptionsButtons(agentContextData, updateAgentContextData);
    
    const interval = setInterval(() => {
      processOptionsButtons(agentContextData, updateAgentContextData);
    }, 250);
    
    return () => clearInterval(interval);
  }, [agentContextData, updateAgentContextData]);

  // Effect for processing task buttons dynamically
  useEffect(() => {
    processTaskButtons();
    
    const interval = setInterval(() => {
      processTaskButtons();
    }, 250);
    
    return () => clearInterval(interval);
  }, [agentContextData, updateAgentContextData]);

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
    <div className="container mx-auto px-4 py-8">
      {/* Add route for example form */}
      {window.location.pathname === '/exampleform' ? (
        <ExampleForm />
      ) : (
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
      )}
    </div>
  );
} 