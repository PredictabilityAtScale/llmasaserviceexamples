import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserPlus, Briefcase, Award, Book, ChevronDown, ChevronUp, Copy, Check, Plus, Trash2, Link, Mail, Globe, Linkedin, Twitter, Github, Calendar, Clock, Tag, BriefcaseIcon, FileText, Star, Building, Users, Settings, BookOpen, X, Sparkles, ArrowRight } from 'lucide-react';
import { BackNavigation } from './common/BackNavigation';
import { useAgent } from '../context/AgentContext';

// Types for our form data
interface LinkItem {
  label: string;
  url: string;
}

interface FormData {
  // Basic Info
  fullName: string;
  headline: string;
  location: string;
  profilePictureUrl: string;
  
  // Contact & Links
  email: string;
  websiteUrl: string;
  linkedinUrl: string;
  twitterHandle: string;
  githubUrl: string;
  otherLinks: LinkItem[];
  
  // Narrative Bio
  bio: string;
  
  // Expertise
  primaryAreas: string;
  secondaryAreas: string;
  industries: string;
  toolsTechnologies: string;
  
  // Services Offered
  services: string;
  availability: string;
  engagementModel: string;
}

// Helper function to get a friendly field name from the path
const getFriendlyFieldName = (path: string): string => {
  const pathParts = path.split('.');
  
  if (pathParts.length < 2) return path;
  
  const section = pathParts[0];
  const field = pathParts[1];
  
  // Map of friendly names for sections
  const sectionNames: Record<string, string> = {
    'basicInfo': 'Basic Info',
    'contactLinks': 'Contact',
    'narrativeBio': 'Bio',
    'expertise': 'Expertise',
    'services': 'Services'
  };
  
  // Map of friendly names for fields
  const fieldNames: Record<string, string> = {
    'fullName': 'Name',
    'headline': 'Headline',
    'location': 'Location',
    'profilePictureUrl': 'Profile Picture',
    'email': 'Email',
    'websiteUrl': 'Website',
    'linkedinUrl': 'LinkedIn',
    'twitterHandle': 'Twitter',
    'githubUrl': 'GitHub',
    'bio': 'Bio',
    'primaryAreas': 'Primary Areas',
    'secondaryAreas': 'Secondary Areas',
    'industries': 'Industries',
    'toolsTechnologies': 'Tools & Tech',
    'services': 'Services',
    'availability': 'Availability',
    'engagementModel': 'Engagement Model'
  };
  
  // Get the friendly names
  const friendlySection = sectionNames[section] || section;
  const friendlyField = fieldNames[field] || field;
  
  // Return the friendly field name
  return friendlyField;
};

// Helper function to clean quoted values
const cleanQuotedValue = (value: string): string => {
  // Check if this is a comma-separated list with quoted items
  if (value.includes('", "') || value.includes("', '")) {
    // Split by comma and clean each item
    return value.split(',').map(item => {
      // Remove all quotes from each item
      return item.trim().replace(/["']/g, '');
    }).join(', ');
  }
  
  // For non-list values, just remove outer quotes
  return value.replace(/^["']|["']$/g, '');
};

// Helper function to process form context elements
const processFormContextElements = (
  agentContextData: any,
  updateAgentContextData: (agentId: string, data: any) => void,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
) => {
  // Find all elements with the form-context class
  const formContextElements = document.querySelectorAll('.form-context');
  
  formContextElements.forEach((element) => {
    // Skip if already processed
    if (element.classList.contains('form-context-processed')) return;
    
    // Mark as processed
    element.classList.add('form-context-processed');
    
    // Try to find if there was a match that triggered this element
    const matchData = element.getAttribute('data-match');
    
    if (matchData) {
      try {
        const matchObj = JSON.parse(matchData);
        if (matchObj && matchObj.groups) {
          const path = matchObj.groups[0] || '';
          let value = matchObj.groups[1] || '';
          
          // Clean up the value - remove any trailing ]
          if (value.endsWith(']')) {
            value = value.substring(0, value.length - 1);
          }
          
          // Store the path in a data attribute for future use
          element.setAttribute('data-path', path);
          
          // Clear the button content
          element.textContent = '';
          
          // Get a friendly field name based on the path
          const friendlyFieldName = getFriendlyFieldName(path);
          
          // Create and append the field label
          const fieldLabel = document.createElement('span');
          fieldLabel.className = 'field-label';
          fieldLabel.textContent = friendlyFieldName + ':';
          element.appendChild(fieldLabel);
          
          // Create and append the field value
          const fieldValue = document.createElement('span');
          fieldValue.className = 'field-value';
          
          // Handle newlines by replacing them with <br> elements
          if (value.includes('\n')) {
            // Create a container for the formatted text
            const formattedText = document.createElement('div');
            formattedText.className = 'formatted-value';
            
            // Split by newlines and create elements for each line
            const lines = value.split('\n');
            lines.forEach((line: string, index: number) => {
              if (index > 0) {
                // Add a line break between lines
                formattedText.appendChild(document.createElement('br'));
              }
              // Add the line text
              formattedText.appendChild(document.createTextNode(line));
            });
            
            fieldValue.appendChild(formattedText);
          } else {
            // If no newlines, just set the text content
            fieldValue.textContent = value;
          }
          
          element.appendChild(fieldValue);
          
          // Add a click event listener to the button
          element.addEventListener('click', () => {
            // Parse the path to determine which field to update
            const pathParts = path.split('.');
            
            // Create a new form data object with the updates
            setFormData(prevFormData => {
              const updatedFormData = { ...prevFormData };
              
              // Clean the value for form updates
              const cleanValue = cleanQuotedValue(value);
              
              // Handle different path patterns
              if (pathParts[0] === 'basicInfo') {
                if (pathParts[1] === 'fullName') updatedFormData.fullName = cleanValue;
                if (pathParts[1] === 'headline') updatedFormData.headline = cleanValue;
                if (pathParts[1] === 'location') updatedFormData.location = cleanValue;
                if (pathParts[1] === 'profilePictureUrl') updatedFormData.profilePictureUrl = cleanValue;
              } else if (pathParts[0] === 'contactLinks') {
                if (pathParts[1] === 'email') updatedFormData.email = cleanValue;
                if (pathParts[1] === 'websiteUrl') updatedFormData.websiteUrl = cleanValue;
                if (pathParts[1] === 'linkedinUrl') updatedFormData.linkedinUrl = cleanValue;
                if (pathParts[1] === 'twitterHandle') updatedFormData.twitterHandle = cleanValue;
                if (pathParts[1] === 'githubUrl') updatedFormData.githubUrl = cleanValue;
              } else if (pathParts[0] === 'narrativeBio') {
                if (pathParts[1] === 'bio') updatedFormData.bio = cleanValue;
              } else if (pathParts[0] === 'expertise') {
                if (pathParts[1] === 'primaryAreas') updatedFormData.primaryAreas = cleanValue;
                if (pathParts[1] === 'secondaryAreas') updatedFormData.secondaryAreas = cleanValue;
                if (pathParts[1] === 'industries') updatedFormData.industries = cleanValue;
                if (pathParts[1] === 'toolsTechnologies') updatedFormData.toolsTechnologies = cleanValue;
              } else if (pathParts[0] === 'services') {
                if (pathParts[1] === 'services') updatedFormData.services = cleanValue;
                if (pathParts[1] === 'availability') updatedFormData.availability = cleanValue;
                if (pathParts[1] === 'engagementModel') updatedFormData.engagementModel = cleanValue;
              }
              
              return updatedFormData;
            });
            
            // Find the corresponding form field and add a highlight effect
            const fieldId = pathParts.join('-').toLowerCase();
            const formField = document.getElementById(fieldId);
            if (formField) {
              formField.classList.add('field-updated');
              setTimeout(() => formField.classList.remove('field-updated'), 1500);
            }
          });
        }
      } catch (e) {
        console.error('Error processing form context element:', e);
      }
    }
  });
};

export function Onboarding() {
  // Form state
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');
  const [copied, setCopied] = useState<boolean>(false);
  const [pastedBio, setPastedBio] = useState<string>('');
  const [isProcessingBio, setIsProcessingBio] = useState<boolean>(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'instructions' | 'context'>('instructions');
  
  // Get the agent context
  const { updateAgentContextData, agentContextData } = useAgent();
  
  // Initialize form data from localStorage or with empty values
  const [formData, setFormData] = useState<FormData>(() => {
    // Try to load from localStorage
    const savedFormData = localStorage.getItem('onboardingFormData');
    if (savedFormData) {
      try {
        return JSON.parse(savedFormData);
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }
    
    // Default empty form data
    return {
      // Basic Info
      fullName: '',
      headline: '',
      location: '',
      profilePictureUrl: '',
      
      // Contact & Links
      email: '',
      websiteUrl: '',
      linkedinUrl: '',
      twitterHandle: '',
      githubUrl: '',
      otherLinks: [],
      
      // Narrative Bio
      bio: '',
      
      // Expertise
      primaryAreas: '',
      secondaryAreas: '',
      industries: '',
      toolsTechnologies: '',
      
      // Services Offered
      services: '',
      availability: '',
      engagementModel: ''
    };
  });
  
  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboardingFormData', JSON.stringify(formData));
  }, [formData]);
  
  // Function to clear the form
  const clearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data? This cannot be undone.')) {
      // Reset form data to empty values
      setFormData({
        // Basic Info
        fullName: '',
        headline: '',
        location: '',
        profilePictureUrl: '',
        
        // Contact & Links
        email: '',
        websiteUrl: '',
        linkedinUrl: '',
        twitterHandle: '',
        githubUrl: '',
        otherLinks: [],
        
        // Narrative Bio
        bio: '',
        
        // Expertise
        primaryAreas: '',
        secondaryAreas: '',
        industries: '',
        toolsTechnologies: '',
        
        // Services Offered
        services: '',
        availability: '',
        engagementModel: ''
      });
      
      // Clear from localStorage
      localStorage.removeItem('onboardingFormData');
      
      // Show success message
      alert('Form data has been cleared.');
      
      // Re-process form context elements after clearing
      setTimeout(() => {
        processFormContextElements(
          agentContextData,
          updateAgentContextData,
          setFormData
        );
      }, 100);
    }
  };
  
  // Define callback function for pattern matching
  const actionCallback = useCallback((match: string, groups: any[]) => {
    // Process form context elements after the DOM updates
    setTimeout(() => {
      processFormContextElements(
        agentContextData,
        updateAgentContextData,
        setFormData
      );
    }, 100);
  }, [agentContextData, updateAgentContextData, setFormData]);
  
  // Define actions for the onboarding agent - use useMemo to prevent recreation on every render
  const onboardingActions = useMemo(() => [
    {
      pattern: "\\[\\[formContext:\\s*([\\w\\.]+)\\s*\\|\\s*([\\s\\S]*?)\\]\\]\\]?",
      type: 'button',
      callback: actionCallback,
      markdown: '$1: $2',  
      style: 'form-context',
      flags: "gm"  // Add flags separately
    }
  ], [actionCallback]);
  
  // Update agent context whenever form data changes
  useEffect(() => {
    // Create a structured JSON object from the form data
    const formContext = {
      basicInfo: {
        fullName: formData.fullName,
        headline: formData.headline,
        location: formData.location,
        profilePictureUrl: formData.profilePictureUrl
      },
      contactLinks: {
        email: formData.email,
        websiteUrl: formData.websiteUrl,
        linkedinUrl: formData.linkedinUrl,
        twitterHandle: formData.twitterHandle,
        githubUrl: formData.githubUrl,
        otherLinks: formData.otherLinks
      },
      narrativeBio: {
        bio: formData.bio
      },
      expertise: {
        primaryAreas: parseList(formData.primaryAreas),
        secondaryAreas: parseList(formData.secondaryAreas),
        industries: parseList(formData.industries),
        toolsTechnologies: parseList(formData.toolsTechnologies)
      },
      services: {
        services: parseList(formData.services),
        availability: formData.availability,
        engagementModel: formData.engagementModel
      }
    };
    
    // Update the agent context with the form data and onboardingActions
    updateAgentContextData('onboarding', { 
      formContext,
      onboardingActions // Pass onboardingActions to the onboarding agent
    });
  }, [formData, updateAgentContextData]); // Remove onboardingActions from dependencies
  
  // Effect for processing form context elements dynamically
  useEffect(() => {
    processFormContextElements(
      agentContextData,
      updateAgentContextData,
      setFormData
    );
    
    const interval = setInterval(() => {
      processFormContextElements(
        agentContextData,
        updateAgentContextData,
        setFormData
      );
    }, 250);
    
    return () => clearInterval(interval);
  }, [agentContextData, updateAgentContextData, setFormData]);
  
  // Additional effect to transform form-context buttons
  useEffect(() => {
    // Function to transform form-context buttons
    const transformFormContextButtons = () => {
      const formContextButtons = document.querySelectorAll('.form-context:not(.form-context-processed)');
      
      formContextButtons.forEach(button => {
        // Skip if already processed
        if (button.classList.contains('form-context-processed')) return;
        
        // Mark as processed
        button.classList.add('form-context-processed');
        
        // Get the button text
        const buttonText = button.textContent || '';
        
        // Check if the text contains a colon (indicating it's in the format "path: value")
        if (buttonText.includes(':')) {
          // Find the first colon to split on, as the value might contain colons
          const colonIndex = buttonText.indexOf(':');
          const path = buttonText.substring(0, colonIndex).trim();
          let value = buttonText.substring(colonIndex + 1).trim();
          
          // Store the path in a data attribute
          button.setAttribute('data-path', path);
          
          // Get a friendly field name based on the path
          const friendlyFieldName = getFriendlyFieldName(path);
          
          // Clean up the value - remove any leading [ or trailing ]
          let cleanValue = value;
          if (cleanValue.startsWith('[')) {
            cleanValue = cleanValue.substring(1);
          }
          if (cleanValue.endsWith(']')) {
            cleanValue = cleanValue.substring(0, cleanValue.length - 1);
          }
          
          // Clear the button content
          button.textContent = '';
          
          // Create and append the field label
          const fieldLabel = document.createElement('span');
          fieldLabel.className = 'field-label';
          fieldLabel.textContent = friendlyFieldName + ':';
          button.appendChild(fieldLabel);
          
          // Create and append the field value
          const fieldValue = document.createElement('span');
          fieldValue.className = 'field-value';
          
          // Handle newlines by replacing them with <br> elements
          if (cleanValue.includes('\n')) {
            // Create a container for the formatted text
            const formattedText = document.createElement('div');
            formattedText.className = 'formatted-value';
            
            // Split by newlines and create elements for each line
            const lines = cleanValue.split('\n');
            lines.forEach((line: string, index: number) => {
              if (index > 0) {
                // Add a line break between lines
                formattedText.appendChild(document.createElement('br'));
              }
              // Add the line text
              formattedText.appendChild(document.createTextNode(line));
            });
            
            fieldValue.appendChild(formattedText);
          } else {
            // If no newlines, just set the text content
            fieldValue.textContent = cleanValue;
          }
          
          button.appendChild(fieldValue);
          
          // Add click event listener
          button.addEventListener('click', () => {
            // Parse the path to determine which field to update
            const pathParts = path.split('.');
            
            // Create a new form data object with the updates
            setFormData(prevFormData => {
              const updatedFormData = { ...prevFormData };
              
              // Clean the value for form updates
              const formValue = cleanQuotedValue(cleanValue);
              
              // Handle different path patterns
              if (pathParts[0] === 'basicInfo') {
                if (pathParts[1] === 'fullName') updatedFormData.fullName = formValue;
                if (pathParts[1] === 'headline') updatedFormData.headline = formValue;
                if (pathParts[1] === 'location') updatedFormData.location = formValue;
                if (pathParts[1] === 'profilePictureUrl') updatedFormData.profilePictureUrl = formValue;
              } else if (pathParts[0] === 'contactLinks') {
                if (pathParts[1] === 'email') updatedFormData.email = formValue;
                if (pathParts[1] === 'websiteUrl') updatedFormData.websiteUrl = formValue;
                if (pathParts[1] === 'linkedinUrl') updatedFormData.linkedinUrl = formValue;
                if (pathParts[1] === 'twitterHandle') updatedFormData.twitterHandle = formValue;
                if (pathParts[1] === 'githubUrl') updatedFormData.githubUrl = formValue;
              } else if (pathParts[0] === 'narrativeBio') {
                if (pathParts[1] === 'bio') updatedFormData.bio = formValue;
              } else if (pathParts[0] === 'expertise') {
                if (pathParts[1] === 'primaryAreas') updatedFormData.primaryAreas = formValue;
                if (pathParts[1] === 'secondaryAreas') updatedFormData.secondaryAreas = formValue;
                if (pathParts[1] === 'industries') updatedFormData.industries = formValue;
                if (pathParts[1] === 'toolsTechnologies') updatedFormData.toolsTechnologies = formValue;
              } else if (pathParts[0] === 'services') {
                if (pathParts[1] === 'services') updatedFormData.services = formValue;
                if (pathParts[1] === 'availability') updatedFormData.availability = formValue;
                if (pathParts[1] === 'engagementModel') updatedFormData.engagementModel = formValue;
              }
              
              return updatedFormData;
            });
            
            // Find the corresponding form field and add a highlight effect
            const fieldId = pathParts.join('-').toLowerCase();
            const formField = document.getElementById(fieldId);
            if (formField) {
              formField.classList.add('field-updated');
              setTimeout(() => formField.classList.remove('field-updated'), 1500);
            }
          });
        }
      });
    };
    
    // Run the transformation function
    transformFormContextButtons();
    
    // Set up a MutationObserver to watch for new form-context buttons
    const observer = new MutationObserver((mutations) => {
      let shouldTransform = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          shouldTransform = true;
        }
      });
      
      if (shouldTransform) {
        transformFormContextButtons();
      }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up the observer when the component unmounts
    return () => observer.disconnect();
  }, [setFormData]);
  
  // Listen for updates from the AI agent
  useEffect(() => {
    const onboardingData = agentContextData['onboarding'];
    if (!onboardingData || !onboardingData.formUpdates) return;
    
    // Process updates from the AI agent
    const updates = onboardingData.formUpdates;
    
    // Create a new form data object with the updates
    const updatedFormData = { ...formData };
    
    // Update basic info
    if (updates.basicInfo) {
      if (updates.basicInfo.fullName) updatedFormData.fullName = updates.basicInfo.fullName;
      if (updates.basicInfo.headline) updatedFormData.headline = updates.basicInfo.headline;
      if (updates.basicInfo.location) updatedFormData.location = updates.basicInfo.location;
      if (updates.basicInfo.profilePictureUrl) updatedFormData.profilePictureUrl = updates.basicInfo.profilePictureUrl;
    }
    
    // Update contact links
    if (updates.contactLinks) {
      if (updates.contactLinks.email) updatedFormData.email = updates.contactLinks.email;
      if (updates.contactLinks.websiteUrl) updatedFormData.websiteUrl = updates.contactLinks.websiteUrl;
      if (updates.contactLinks.linkedinUrl) updatedFormData.linkedinUrl = updates.contactLinks.linkedinUrl;
      if (updates.contactLinks.twitterHandle) updatedFormData.twitterHandle = updates.contactLinks.twitterHandle;
      if (updates.contactLinks.githubUrl) updatedFormData.githubUrl = updates.contactLinks.githubUrl;
      if (updates.contactLinks.otherLinks) updatedFormData.otherLinks = updates.contactLinks.otherLinks;
    }
    
    // Update narrative bio
    if (updates.narrativeBio && updates.narrativeBio.bio) {
      updatedFormData.bio = updates.narrativeBio.bio;
    }
    
    // Update expertise
    if (updates.expertise) {
      if (updates.expertise.primaryAreas) updatedFormData.primaryAreas = Array.isArray(updates.expertise.primaryAreas) 
        ? updates.expertise.primaryAreas.join(', ') 
        : updates.expertise.primaryAreas;
      if (updates.expertise.secondaryAreas) updatedFormData.secondaryAreas = Array.isArray(updates.expertise.secondaryAreas) 
        ? updates.expertise.secondaryAreas.join(', ') 
        : updates.expertise.secondaryAreas;
      if (updates.expertise.industries) updatedFormData.industries = Array.isArray(updates.expertise.industries) 
        ? updates.expertise.industries.join(', ') 
        : updates.expertise.industries;
      if (updates.expertise.toolsTechnologies) updatedFormData.toolsTechnologies = Array.isArray(updates.expertise.toolsTechnologies) 
        ? updates.expertise.toolsTechnologies.join(', ') 
        : updates.expertise.toolsTechnologies;
    }
    
    // Update services
    if (updates.services) {
      if (updates.services.services) updatedFormData.services = Array.isArray(updates.services.services) 
        ? updates.services.services.join(', ') 
        : updates.services.services;
      if (updates.services.availability) updatedFormData.availability = updates.services.availability;
      if (updates.services.engagementModel) updatedFormData.engagementModel = updates.services.engagementModel;
    }
    
    // Update the form data
    setFormData(updatedFormData);
    
    // Clear the updates from the context to avoid processing them again
    updateAgentContextData('onboarding', { 
      ...onboardingData,
      formUpdates: null 
    });
  }, [agentContextData, updateAgentContextData]);
  
  // Handle pasted bio
  const handlePastedBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPastedBio(e.target.value);
  };
  
  // Process the pasted bio with the AI agent
  const processPastedBio = () => {
    if (!pastedBio.trim()) return;
    
    setIsProcessingBio(true);
    
    // Send the pasted bio to the AI agent for processing
    updateAgentContextData('onboarding', { 
      ...agentContextData['onboarding'],
      processBio: pastedBio
    });
    
    // Clear the pasted bio after sending
    setPastedBio('');
    
    // Reset the processing state after a delay
    setTimeout(() => {
      setIsProcessingBio(false);
    }, 2000);
  };
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle other link changes
  const handleOtherLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    const updatedLinks = [...formData.otherLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setFormData(prev => ({ ...prev, otherLinks: updatedLinks }));
  };
  
  // Add new other link
  const addOtherLink = () => {
    setFormData(prev => ({
      ...prev,
      otherLinks: [...prev.otherLinks, { label: '', url: '' }]
    }));
  };
  
  // Remove other link
  const removeOtherLink = (index: number) => {
    const updatedLinks = [...formData.otherLinks];
    updatedLinks.splice(index, 1);
    setFormData(prev => ({ ...prev, otherLinks: updatedLinks }));
  };
  
  // Copy content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Parse comma or newline separated text into array
  const parseList = (text: string): string[] => {
    if (!text) return [];
    return text.split(/[,\n]/).map(item => item.trim()).filter(item => item);
  };
  
  return (
    <div className="h-full overflow-y-auto">
      <BackNavigation />
      
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowWelcomeModal(false)}>
          <div 
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Welcome to the Onboarding Demo</h2>
                    <p className="text-sm text-gray-600">Create your professional profile with AI assistance</p>
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
            <div className="p-6 space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600">
                  Experience effortless profile creation with our Onboarding Agent Demo. This demo showcases an AI-powered assistant that transforms the tedious process of building a professional profile into an interactive, guided experience.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6">Key Features</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>AI-guided profile creation with real-time suggestions</li>
                  <li>Smart content analysis of existing profiles (LinkedIn, resumes, etc.)</li>
                  <li>Automatic field population and content refinement</li>
                  <li>Interactive form with live preview</li>
                  <li>Comprehensive sections for expertise, services, and more</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Getting Started</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>If you have an existing profile (LinkedIn, resume, etc.), paste it into the AI Agent for automatic analysis and field population</li>
                  <li>Review and refine the AI-suggested content in each section</li>
                  <li>Add any missing information or expand on areas that need more detail</li>
                  <li>Use the AI suggestions to enhance and polish your profile content</li>
                  <li>Preview your profile in real-time as you make changes</li>
                </ol>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-amber-800">
                    <span className="font-medium">Tip:</span> The AI agent can analyze any existing professional content you have. Simply paste your LinkedIn profile, resume, or other professional content, and the AI will help organize and enhance it for this platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Consultant Profile</h1>
              <p className="text-gray-600">Create and preview your professional profile</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={clearForm}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Form</span>
            </button>
            
            <button
              onClick={() => setShowInstructionsModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Show AI Agent Instructions
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Column */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Form</h2>
            
            <form className="space-y-6">
              {/* Basic Info Section */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('basic')}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-gray-900">Basic Info</h3>
                  </div>
                  {expandedSection === 'basic' ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                
                {expandedSection === 'basic' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Full Name*</label>
                      <input 
                        type="text" 
                        name="fullName"
                        id="basicinfo-fullname"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        required 
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Headline*</label>
                      <input 
                        type="text" 
                        name="headline"
                        id="basicinfo-headline"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        required 
                        value={formData.headline}
                        onChange={handleInputChange}
                        placeholder="Enterprise Agile Coach"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Location*</label>
                      <input 
                        type="text" 
                        name="location"
                        id="basicinfo-location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        required 
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Remote (San Francisco Bay Area)"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Profile Picture URL</label>
                      <input 
                        type="url" 
                        name="profilePictureUrl"
                        id="basicinfo-profilepictureurl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={formData.profilePictureUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/profile.jpg"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contact & Links Section */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('contact')}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <Link className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-gray-900">Contact & Links</h3>
                  </div>
                  {expandedSection === 'contact' ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                
                {expandedSection === 'contact' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Email*</label>
                      <input 
                        type="email" 
                        name="email"
                        id="contactlinks-email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        required 
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Website URL</label>
                      <input 
                        type="url" 
                        name="websiteUrl"
                        id="contactlinks-websiteurl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={formData.websiteUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">LinkedIn URL</label>
                      <input 
                        type="url" 
                        name="linkedinUrl"
                        id="contactlinks-linkedinurl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Twitter Handle</label>
                      <input 
                        type="text" 
                        name="twitterHandle"
                        id="contactlinks-twitterhandle"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={formData.twitterHandle}
                        onChange={handleInputChange}
                        placeholder="@johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">GitHub URL</label>
                      <input 
                        type="url" 
                        name="githubUrl"
                        id="contactlinks-githuburl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        placeholder="https://github.com/johndoe"
                      />
                    </div>
                    
                    {/* Other Links */}
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Other Links</label>
                      {formData.otherLinks.map((link, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input 
                            type="text" 
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md" 
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => handleOtherLinkChange(index, 'label', e.target.value)}
                          />
                          <input 
                            type="url" 
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md" 
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => handleOtherLinkChange(index, 'url', e.target.value)}
                          />
                          <button 
                            type="button"
                            onClick={() => removeOtherLink(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={addOtherLink}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Link</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Narrative Bio Section */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('bio')}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-gray-900">Narrative Bio</h3>
                  </div>
                  {expandedSection === 'bio' ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                
                {expandedSection === 'bio' && (
                  <div className="mt-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Professional Biography*</label>
                      <textarea 
                        name="bio"
                        id="narrativebio-bio"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-64" 
                        required 
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Write a compelling professional biography that highlights your expertise, experience, and unique value proposition..."
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Expertise Section */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('expertise')}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      <Star className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-gray-900">Expertise</h3>
                  </div>
                  {expandedSection === 'expertise' ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                
                {expandedSection === 'expertise' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Primary Areas of Expertise*</label>
                      <textarea 
                        name="primaryAreas"
                        id="expertise-primaryareas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-20" 
                        required 
                        value={formData.primaryAreas}
                        onChange={handleInputChange}
                        placeholder="List your main areas of expertise, separated by commas or new lines"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Secondary Areas of Expertise</label>
                      <textarea 
                        name="secondaryAreas"
                        id="expertise-secondaryareas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-20" 
                        value={formData.secondaryAreas}
                        onChange={handleInputChange}
                        placeholder="List additional areas of expertise, separated by commas or new lines"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Industries</label>
                      <textarea 
                        name="industries"
                        id="expertise-industries"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-20" 
                        value={formData.industries}
                        onChange={handleInputChange}
                        placeholder="List industries you've worked in, separated by commas or new lines"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Tools & Technologies</label>
                      <textarea 
                        name="toolsTechnologies"
                        id="expertise-toolstechnologies"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-20" 
                        value={formData.toolsTechnologies}
                        onChange={handleInputChange}
                        placeholder="List relevant tools and technologies, separated by commas or new lines"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Services Section */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('services')}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                      <Settings className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-gray-900">Services Offered</h3>
                  </div>
                  {expandedSection === 'services' ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                
                {expandedSection === 'services' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Services*</label>
                      <textarea 
                        name="services"
                        id="services-services"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-20" 
                        required 
                        value={formData.services}
                        onChange={handleInputChange}
                        placeholder="List the services you offer, separated by commas or new lines"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Availability</label>
                      <input 
                        type="text" 
                        name="availability"
                        id="services-availability"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={formData.availability}
                        onChange={handleInputChange}
                        placeholder="e.g., Available for 6-month engagements"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Engagement Model</label>
                      <input 
                        type="text" 
                        name="engagementModel"
                        id="services-engagementmodel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        value={formData.engagementModel}
                        onChange={handleInputChange}
                        placeholder="e.g., Remote, Hybrid, On-site"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
          
          {/* Preview Column */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Preview</h2>
            
            <div className="space-y-6">
              {/* Basic Info Preview */}
              <div className="flex items-start gap-4">
                {formData.profilePictureUrl ? (
                  <img 
                    src={formData.profilePictureUrl} 
                    alt={formData.fullName} 
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserPlus className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{formData.fullName || 'Your Name'}</h3>
                  <p className="text-gray-600">{formData.headline || 'Your Headline'}</p>
                  <p className="text-gray-500 text-sm">{formData.location || 'Your Location'}</p>
                </div>
              </div>
              
              {/* Contact & Links Preview */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Contact & Links</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.email && (
                    <a href={`mailto:${formData.email}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </a>
                  )}
                  {formData.websiteUrl && (
                    <a href={formData.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {formData.linkedinUrl && (
                    <a href={formData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {formData.twitterHandle && (
                    <a href={`https://twitter.com/${formData.twitterHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Twitter className="h-4 w-4" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {formData.githubUrl && (
                    <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {formData.otherLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Link className="h-4 w-4" />
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Bio Preview */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">About</h4>
                <p className="text-gray-600 whitespace-pre-line">{formData.bio || 'Your professional biography will appear here...'}</p>
              </div>
              
              {/* Expertise Preview */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Expertise</h4>
                
                {formData.primaryAreas && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Primary Areas</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parseList(formData.primaryAreas).map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.secondaryAreas && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Secondary Areas</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parseList(formData.secondaryAreas).map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.industries && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Industries</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parseList(formData.industries).map((industry, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.toolsTechnologies && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Tools & Technologies</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parseList(formData.toolsTechnologies).map((tool, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Services Preview */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Services</h4>
                
                {formData.services && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Offerings</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parseList(formData.services).map((service, index) => (
                        <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(formData.availability || formData.engagementModel) && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Engagement Details</h5>
                    <div className="space-y-1">
                      {formData.availability && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Availability:</span> {formData.availability}
                        </p>
                      )}
                      {formData.engagementModel && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Engagement Model:</span> {formData.engagementModel}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
                  onClick={() => setActiveInstructionTab('instructions')}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeInstructionTab === 'instructions'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activeInstructionTab === 'instructions'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600'
                  }`}>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Profile Coach</p>
                    <p className={`text-xs ${
                      activeInstructionTab === 'instructions' ? 'text-blue-100' : 'text-gray-500'
                    }`}>Core agent instructions</p>
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
              {activeInstructionTab === 'instructions' && (
                <div className="prose prose-sm max-w-none">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">🟣 System Instructions for Profile Coaching LLM Agent</h2>

                  <div className="space-y-6">
                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Your Role</h3>
                      <div className="pl-4">
                        <p>You are an AI assistant acting as a helpful and encouraging coach. Your goal is to guide consultants ("users") through the process of creating a comprehensive, professional, and effective profile for an expert directory.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Your Primary Goal</h3>
                      <div className="pl-4">
                        <p>Help the user populate their profile data below thoroughly and strategically, ensuring it accurately reflects their expertise and is appealing to those searching the directory.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Context Provided</h3>
                      <div className="pl-4">
                        <p>You will receive the user's current profile data in JSON format below. The structure and comments within this JSON define the expected information for each field.</p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
                          <p className="font-mono text-sm">{"{{formContext}}"}</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Formatting Suggestions for Specific Content</h3>
                      <div className="pl-4">
                        <p className="font-medium mb-2">IMPORTANT: When you are suggesting specific content (e.g., exact text, a complete list item, a specific URL) to replace or fill a particular field within the formContext, use the following format:</p>
                        <p className="font-mono bg-gray-50 p-2 rounded mt-2">{"[[formContext: <json_path> | <suggested_content>]]"}</p>
                        
                        <p className="mt-4 mb-2">Where:</p>
                        <ul className="list-disc pl-6 mb-4">
                          <li>&lt;json_path&gt; is the precise path to the field within the formContext JSON using dot notation (e.g., basicInfo.headline, expertise.primaryAreas, contactLinks.otherLinks[0].label).</li>
                          <li>&lt;suggested_content&gt; is the exact string, array, or JSON object content you are proposing for that field. Represent arrays using standard JSON array syntax ["item1", "item2"].</li>
                        </ul>
                        
                        <p className="font-medium mb-2">Examples:</p>
                        <ul className="list-disc pl-6 mb-4">
                          <li>Suggesting a specific headline:
                            <p className="font-mono bg-gray-50 p-2 rounded mt-2">{"[[formContext: basicInfo.headline | Senior Lean-Agile Transformation Consultant]]"}</p>
                          </li>
                          <li>Suggesting a complete list for primary expertise areas (replacing any existing):
                            <p className="font-mono bg-gray-50 p-2 rounded mt-2">{"[[formContext: expertise.primaryAreas | [\"Agile Coaching\", \"Value Stream Mapping\", \"SAFe Implementation\"]]]"}</p>
                          </li>
                          <li>Suggesting a specific URL:
                            <p className="font-mono bg-gray-50 p-2 rounded mt-2">{"[[formContext: contactLinks.linkedinUrl | https://www.linkedin.com/in/your-profile-here/]]"}</p>
                          </li>
                          <li>Suggesting a corrected label for the first item in otherLinks:
                            <p className="font-mono bg-gray-50 p-2 rounded mt-2">{"[[formContext: contactLinks.otherLinks[0].label | Professional Blog]]"}</p>
                          </li>
                          <li>Suggesting specific text for the availability field:
                            <p className="font-mono bg-gray-50 p-2 rounded mt-2">{"[[formContext: services.availability | Available for new engagements starting Q3 2025]]"}</p>
                          </li>
                        </ul>
                        
                        <p>Use this format ONLY for suggesting specific, concrete data replacements or additions. For general advice, prompts, questions, or suggestions on how to improve content without providing the exact text, use standard markdown formatting. Crucially, do not explain or mention the [[formContext:...]] format itself to the user. It is purely a mechanism for presenting suggestions to them. Your conversational text should remain focused on the profile content; use the advanced markdown techniques described in point #5 to make this conversation clear, structured, and easy to follow – consider this part of a helpful coaching interaction.</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Your Core Tasks & Behavior</h3>
                      <div className="pl-4 space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">1. Analyze Current State</h4>
                          <p>Examine the provided profile Context. Identify which fields are empty, partially filled, or could be improved based on best practices for professional profiles.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">2. Prioritize Guidance</h4>
                          <p>Focus your coaching on the most impactful sections first. Generally, prioritize in this order:</p>
                          <ul className="list-disc pl-6">
                            <li>basicInfo (especially fullName, headline)</li>
                            <li>narrativeBio</li>
                            <li>expertise.primaryAreas</li>
                            <li>services.offerings</li>
                            <li>Remaining expertise fields</li>
                            <li>contactLinks (especially linkedinUrl and websiteUrl)</li>
                            <li>Remaining fields (services.availability, services.engagementModel, etc.)</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">3. Provide Contextual & Actionable Advice</h4>
                          <ul className="list-disc pl-6">
                            <li>If a key field is empty: Gently prompt the user to fill it in, explaining its importance. You might suggest a specific starting point using the [[formContext:...]] format if appropriate.</li>
                            <li>If a field is partially filled or could be stronger: Offer specific suggestions for improvement based on the field's purpose. If you have a concrete suggestion for replacement text or data, use the [[formContext:...]] format. Otherwise, provide general guidance.</li>
                            <li>Use the JSON Comments: Refer to the // comments within the profile Context structure to understand the intended content for each field and guide the user accordingly.</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">4. Encourage Detail and Keywords</h4>
                          <p>Remind the user that detailed descriptions and relevant keywords (especially in expertise and narrativeBio) help others find their profile through search.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">5. Maintain a Positive and Professional Tone</h4>
                          <p>Be encouraging, supportive, and polite. Frame suggestions constructively. Avoid being overly critical. For all responses outside of the specific [[formContext:...]] tags, actively seek opportunities to use advanced and engaging markdown formatting. Employ techniques like headers, subheaders, bullet points, numbered lists, bold/italic text, blockquotes, and horizontal rules where appropriate. Do not default to plain paragraphs; make your coaching visually distinct, structured, and easy to scan.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">6. Do Not Write Content (Unless Suggesting via Tag)</h4>
                          <p>Your role is primarily to guide and prompt. Only provide specific content suggestions using the designated [[formContext:...]] tag format when appropriate. Do not invent profile content outside of this mechanism. Ask questions that help them articulate their experience and offerings.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">7. Be Iterative</h4>
                          <p>Acknowledge user input and adjust your guidance based on the updated profile Context. You might cycle through sections until the profile reaches a good level of completion. Start with a general prompt if the context is mostly empty, then get more specific as fields are filled.</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Example Interaction Snippets</h3>
                      <div className="pl-4 space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">(Start/Empty Context)</h4>
                          <p className="italic bg-gray-50 p-2 rounded">"Welcome! Let's create a standout profile for the directory. To begin, could you please provide your Full Name and a professional Headline in the 'Basic Info' section?"</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">(Bio is Short - General Advice)</h4>
                          <p className="italic bg-gray-50 p-2 rounded">"Thanks for adding your bio! It's a good overview. Could you perhaps elaborate on your professional philosophy or add a specific example of how you approach client challenges?"</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">(Suggesting Headline)</h4>
                          <p className="italic bg-gray-50 p-2 rounded">"Based on your bio mentioning transformation leadership, a strong headline could be: [[formContext: basicInfo.headline | Agile Transformation Lead & Coach]]. What do you think?"</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">(Expertise needs detail - Suggesting Addition)</h4>
                          <p className="italic bg-gray-50 p-2 rounded">"I see you've added 'Agile Coaching' to Primary Areas. That's great! Many coaches also list specific frameworks. Would adding 'SAFe Program Consultant (SPC)' be relevant? You could update the list like this: [[formContext: expertise.primaryAreas | ["Agile Coaching", "SAFe Program Consultant (SPC)"]]]"</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">(Checking Completion - General Prompt)</h4>
                          <p className="italic bg-gray-50 p-2 rounded">"Your profile is coming along nicely! We still need to detail the specific services you offer under 'Services'. What are the main ways you help clients?"</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}
              
              {activeInstructionTab === 'context' && (
                <div className="space-y-4">
                  {Object.entries(agentContextData['onboarding'] || {}).map(([key, value]) => (
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