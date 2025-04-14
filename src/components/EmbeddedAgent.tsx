import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAgent } from '../context/AgentContext';
import { examples, ExampleConfig } from '../lib/examples';
import ReactMarkdown from 'react-markdown';

// Helper function to clean quoted values (reused from Onboarding)
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

// Track last log time to avoid spamming
let lastLogTime = 0;

const processAgentConfigElements = (
  setters: { [key: string]: React.Dispatch<React.SetStateAction<string>> }
) => {
  // Only log every 5 seconds at most
  const now = Date.now();
  const shouldLog = now - lastLogTime > 5000;
  
  if (shouldLog) {
    console.log('[EmbeddedAgent] Attempting to process agent config elements...');
    lastLogTime = now;
  }
  
  // Update selector to match the 'form-context' class used in the style property
  const configContextElements = document.querySelectorAll('.form-context:not(.form-context-processed)');
  
  if (configContextElements.length > 0) {
    console.log(`[EmbeddedAgent] Found ${configContextElements.length} unprocessed elements.`);
    
    configContextElements.forEach((element) => {
      // Mark as processed with the correct class
      element.classList.add('form-context-processed');
      
      // Add the click event listener without modifying the DOM structure
      element.addEventListener('click', () => {
        // Extract the text content directly
        const buttonText = element.textContent || '';
        
        // Check if the text contains a colon (indicating it's in the format "path: value")
        if (buttonText.includes(':')) {
          // Find the first colon to split on, as the value might contain colons
          const colonIndex = buttonText.indexOf(':');
          const path = buttonText.substring(0, colonIndex).trim();
          let value = buttonText.substring(colonIndex + 1).trim();
          
          // Get field key from path (e.g., agentConfigContext.regexPattern -> regexPattern)
          const pathParts = path.split('.');
          const fieldKey = pathParts.length > 1 ? pathParts[1] : '';
          
          // Special handling for CSS content
          const isRegexPattern = fieldKey === 'regexPattern';
          const isResponsePattern = fieldKey === 'responsePattern';
          
          // Clean up the value - but preserve escaped brackets in regex patterns
          let cleanValue = value;
          
          // Only remove literal brackets for fields that aren't regex or response patterns
          if (!isRegexPattern && !isResponsePattern) {
            if (cleanValue.startsWith('[')) {
              cleanValue = cleanValue.substring(1);
            }
            if (cleanValue.endsWith(']')) {
              cleanValue = cleanValue.substring(0, cleanValue.length - 1);
            }
          }
          
          console.log('[EmbeddedAgent] Button clicked! Path:', path, 'Value:', cleanValue);
          
          // Find the correct setter based on the fieldKey
          const setter = setters[fieldKey];
          if (setter) {
            setter(cleanQuotedValue(cleanValue));
            
            // Map the field keys to the correct input IDs
            const idMap: Record<string, string> = {
              'responsePattern': 'responsepattern',
              'regexPattern': 'regexpattern',
              'responseType': 'responsetype',
              'style': 'style',
              'flags': 'flags',
              'callback': 'callback',
              'markdown': 'markdown',
              'css': 'css'
            };
            
            // Use the mapped ID or fallback to lowercase
            const inputId = idMap[fieldKey] || fieldKey.toLowerCase();
            const formField = document.getElementById(inputId);
            if (formField) {
              formField.classList.add('field-updated');
              setTimeout(() => formField.classList.remove('field-updated'), 1500);
            } else {
              console.warn(`[EmbeddedAgent] Could not find form field with ID: ${inputId}`);
            }
          } else {
            console.warn(`[EmbeddedAgent] No state setter found for key: ${fieldKey}`);
          }
        } else {
          console.warn('[EmbeddedAgent] Button text does not contain a colon:', buttonText);
        }
      });
    });
  }
};

export function EmbeddedAgent() {
  const { updateAgentContextData } = useAgent();

  // --- Define ALL state variables first ---
  const [buttonFormat, setButtonFormat] = useState('');
  const [regex, setRegex] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [css, setCss] = useState('');
  const [style, setStyle] = useState('');
  const [flags, setFlags] = useState('');
  const [callback, setCallback] = useState('');
  const [responseType, setResponseType] = useState('button');
  const [currentCss, setCurrentCss] = useState(() => {
    const saved = localStorage.getItem('currentCss');
    return saved || '';
  });
  const [currentActionJson, setCurrentActionJson] = useState(() => {
    const saved = localStorage.getItem('currentActionJson');
    return saved || '{}';
  });
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [actionJson, setActionJson] = useState('{}');
  const [activeTab, setActiveTab] = useState('markdown');
  const [iframeUrl, setIframeUrl] = useState('');

  // --- State setters map for processing function ---
  const stateSetters = useMemo(() => ({
    responsePattern: setButtonFormat,
    regexPattern: setRegex,
    markdown: setMarkdown,
    css: setCss,
    style: setStyle,
    flags: setFlags,
    callback: setCallback,
    responseType: setResponseType,
  }), [setButtonFormat, setRegex, setMarkdown, setCss, setStyle, setFlags, setCallback, setResponseType]);

  // --- Action Callback and Actions Definition ---
  const configActionCallback = useCallback(() => {
    console.log('[EmbeddedAgent] configActionCallback triggered');
    setTimeout(() => {
      processAgentConfigElements(stateSetters);
    }, 50);
  }, [stateSetters]);

  // Updated agentConfigActions with improved pattern and style
  const agentConfigActions = useMemo(() => [
    {
      pattern: "\\<\\<formContext:\\s*(agentConfigContext\\.[\\w\\.]+)\\s*\\|\\s*([\\s\\S]*?)\\>\\>", 
      type: 'button',
      callback: configActionCallback,
      markdown: '$1: $2',  
      style: 'form-context',
      flags: "gm"
    }
  ], [configActionCallback]);

  // --- Update Agent Context with Config State and Actions ---
  useEffect(() => {
    const agentConfigContext = {
      responsePattern: buttonFormat,
      regexPattern: regex,
      markdown: markdown,
      css: css,
      style: style,
      flags: flags,
      callback: callback,
      responseType: responseType,
    };

    updateAgentContextData('llmaserviceinfo', (prevAgentData: any) => ({
      ...(prevAgentData || {}),
      agentConfigContext, 
      agentConfigActions
    }));
  }, [buttonFormat, regex, markdown, css, style, flags, callback, responseType, agentConfigActions, updateAgentContextData]);

  // --- Dynamic Processing Hooks ---
  useEffect(() => {
    const process = () => {
      processAgentConfigElements(stateSetters);
    };
    
    process();
    
    const interval = setInterval(process, 1000);
    return () => clearInterval(interval);
  }, [stateSetters]);

  // Mutation Observer Processing
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldTransform = false;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element && (node.matches('.form-context:not(.form-context-processed)') || node.querySelector('.form-context:not(.form-context-processed)'))) {
            shouldTransform = true;
          }
        });
      });
      if (shouldTransform) {
        processAgentConfigElements(stateSetters);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [stateSetters]);

  // --- Existing Effects & Handlers ---
  useEffect(() => {
    localStorage.setItem('currentCss', currentCss);
  }, [currentCss]);

  useEffect(() => {
    localStorage.setItem('currentActionJson', currentActionJson);
  }, [currentActionJson]);

  const handleExampleSelect = (example: ExampleConfig) => {
    setButtonFormat(example.responsePattern);
    setRegex(example.regexPattern);
    setResponseType(example.responseType);
    setMarkdown(example.markdown);
    setCss(example.css);
    setStyle(example.style || '');
    setFlags(example.flags || '');
    setCallback(example.callback || '');
  };

  useEffect(() => {
    try {
      // Process captures for the preview effect
      let processedMarkdown = markdown;
      let processedCss = css;
      
      if (regex && buttonFormat) {
        const regexPattern = new RegExp(regex, flags || undefined);
        
        // Only process if the regex actually matches
        if (regexPattern.test(buttonFormat)) {
          const matches = buttonFormat.match(regexPattern);
          
          if (matches && matches.length > 1) {
            // Replace $1, $2, etc. in markdown with actual captured values
            processedMarkdown = markdown.replace(/\$(\d+)/g, (match, group) => {
              const groupNum = parseInt(group, 10);
              return matches[groupNum] || match;
            });
            
            processedCss = css.replace(/\$(\d+)/g, (match, group) => {
              const groupNum = parseInt(group, 10);
              return matches[groupNum] || match;
            });
          }
        }
      }
      
      const action: any = {
        pattern: regex,
        type: responseType,
        markdown: responseType === 'html' ? `${processedMarkdown}<style>${processedCss}</style>` : processedMarkdown
      };

      if (style) action.style = style;
      if (flags) action.flags = flags;
      if (callback) action.callback = callback;

      setActionJson(JSON.stringify([action], null, 2));
    } catch (e) {
      console.warn('[EmbeddedAgent] Error generating action JSON:', e);
      setActionJson(JSON.stringify([{
        pattern: regex,
        type: responseType,
        markdown: responseType === 'html' ? `${markdown}<style>${css}</style>` : markdown,
        style: style || undefined,
        flags: flags || undefined,
        callback: callback || undefined
      }], null, 2));
    }
  }, [regex, responseType, markdown, css, style, flags, callback, buttonFormat]);

  const generateIframeUrl = () => {
    const params = new URLSearchParams({
      buttonFormat,
      regex,
      markdown
    });
    return `/exampleform?${params.toString()}`;
  };

  const renderPreviewContent = () => {
    try {
      // Check if regex matches the button format
      const regexPattern = new RegExp(regex, flags || undefined);
      const regexMatches = regexPattern.test(buttonFormat);
      
      // Only show formatted content when the regex matches
      if (!regexMatches) {
        return <div>{buttonFormat}</div>;
      }
      
      // Process captures from regex and apply them to markdown
      let processedMarkdown = markdown;
      let processedCss = css;
      
      // If the regex pattern includes capture groups, process them
      if (regex && buttonFormat) {
        // Execute the regex to get capture groups
        const matches = buttonFormat.match(regexPattern);
        
        if (matches && matches.length > 1) {
          // Replace $1, $2, etc. in markdown with actual captured values
          processedMarkdown = markdown.replace(/\$(\d+)/g, (match, group) => {
            const groupNum = parseInt(group, 10);
            return matches[groupNum] || match; // Return the capture group or original if not found
          });
          
          // Also apply to CSS if needed
          processedCss = css.replace(/\$(\d+)/g, (match, group) => {
            const groupNum = parseInt(group, 10);
            return matches[groupNum] || match;
          });
        }
      }
      
      // Otherwise, render based on response type
      if (responseType === 'html') {
        return (
          <div dangerouslySetInnerHTML={{ __html: `${processedMarkdown}<style>${processedCss}</style>` }} />
        );
      } else if (responseType === 'markdown') {
        return (
          <ReactMarkdown
            components={{
              img: ({ node, ...props }) => (
                <img {...props} style={{ maxWidth: '100%', height: 'auto' }} />
              ),
              p: ({ node, ...props }) => (
                <p {...props} style={{ margin: '1em 0' }} />
              )
            }}
          >
            {processedMarkdown}
          </ReactMarkdown>
        );
      } else if (responseType === 'button') {
        // Improved button rendering for markdown links
        const buttonMatch = processedMarkdown.match(/\[(.*?)\]\((.*?)\)/);
        const buttonText = buttonMatch ? buttonMatch[1] : processedMarkdown; // Default to raw markdown if no link
        const buttonUrl = buttonMatch ? buttonMatch[2] : ''; // Default to empty string instead of # to avoid DOM nesting
        const buttonClass = style ? style : "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
        
        // IMPORTANT: Return only an anchor OR a button, not a button containing an anchor
        if (buttonUrl) {
          return (
            <a 
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
              style={{ 
                margin: '0.5em 0',
                display: 'inline-block',
                textDecoration: 'none',
                color: 'white'
              }}
            >
              <style>{processedCss}</style>
              {buttonText}
            </a>
          );
        } else {
          return (
            <button 
              className={buttonClass} 
              style={{ margin: '0.5em 0' }}
            >
              <style>{processedCss}</style>
              {buttonText}
            </button>
          );
        }
      }
    } catch (e) {
      console.warn('[EmbeddedAgent] Error in renderPreviewContent:', e);
    }
    
    // Default case: render the raw button format string
    return <div>{buttonFormat}</div>;
  };

  // Add a useEffect for direct DOM inspection of agent responses
  useEffect(() => {
    // Wait for possible agent response to be rendered
    const timeout = setTimeout(() => {
      // Look for the agent response container - adjust selector as needed
      const agentResponseContainer = document.querySelector('.agent-panel .response-container');
      
      if (agentResponseContainer) {
        console.log('[EmbeddedAgent] Found agent response container:', agentResponseContainer);
        console.log('[EmbeddedAgent] Raw HTML content:', agentResponseContainer.innerHTML);
        
        // Specifically look for any element that might contain a formContext string
        const elements = Array.from(agentResponseContainer.querySelectorAll('*'));
        const formContextElements = elements.filter(el => 
          el.textContent && el.textContent.includes('formContext')
        );
        
        if (formContextElements.length > 0) {
          console.log('[EmbeddedAgent] Elements containing formContext:', formContextElements);
          formContextElements.forEach(el => {
            console.log('Element:', el);
            console.log('Text content:', el.textContent);
          });
        } else {
          console.log('[EmbeddedAgent] No elements containing formContext found.');
        }
        
        // Also check for code blocks specifically
        const codeElements = agentResponseContainer.querySelectorAll('code, pre');
        if (codeElements.length > 0) {
          console.log('[EmbeddedAgent] Code blocks in response:', codeElements);
          codeElements.forEach(el => {
            if (el.textContent && el.textContent.includes('formContext')) {
              console.log('[EmbeddedAgent] Found formContext inside code block:', el);
            }
          });
        }
      }
    }, 2000); // Check 2 seconds after mount
    
    return () => clearTimeout(timeout);
  }, []); // Run once on mount

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left side - Configuration */}
      <div className="w-2/3 p-6 overflow-y-auto">
        <style>
          {`
            .form-context {
              display: inline-block;
              margin: 4px 2px;
              padding: 6px 12px;
              border: 1px solid #cbd5e1; /* cool-gray-300 */
              border-radius: 8px;
              background-color: #f8fafc; /* cool-gray-50 */
              cursor: pointer;
              transition: all 0.2s ease-in-out;
              font-size: 0.875rem; /* text-sm */
              line-height: 1.25rem;
            }
            .form-context:hover {
              background-color: #f1f5f9; /* cool-gray-100 */
              border-color: #94a3b8; /* cool-gray-400 */
              box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            }
            .form-context .field-label {
              font-weight: 500; /* medium */
              color: #4f46e5; /* indigo-600 */
              margin-right: 6px;
              display: inline-block;
            }
            .form-context .field-value {
              color: #374151; /* cool-gray-700 */
              display: inline-block;
              margin-top: 4px;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .form-context .formatted-value.code-preview {
              display: inline;
              font-family: monospace;
              background-color: #e0e7ff; /* indigo-100 */
              padding: 2px 4px;
              border-radius: 4px;
              font-size: 0.8em;
              line-height: 1.5;
              white-space: pre-wrap;
              word-break: break-word;
            }
            /* Code container for multi-line code */
            .form-context .code-container {
              background-color: #f1f5f9;
              border-radius: 4px;
              padding: 4px;
              margin-top: 8px;
              width: 100%;
              max-width: 500px;
            }
            /* CSS content highlighting */
            .form-context .css-content {
              color: #0284c7; /* sky-600 */
            }
            /* Add this for multi-line field values */
            .form-context .formatted-value {
              display: block;
              line-height: 1.5;
              white-space: pre-wrap;
              word-break: break-word;
              margin-top: 4px;
            }
            /* When the content is long, make sure we wrap properly */
            .form-context {
              max-width: 100%;
              white-space: normal;
              word-wrap: break-word;
            }
            /* For when the field label and value are on the same line */
            .form-context.single-line {
              display: flex;
              flex-wrap: wrap;
              align-items: baseline;
            }
            .form-context.single-line .field-label {
              margin-right: 6px;
            }
            .form-context.single-line .field-value {
              flex: 1;
              min-width: 0;
            }
            /* Improve multi-line layout */
            .form-context.multi-line {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 8px 16px;
            }
            .form-context.multi-line .field-label {
              margin-bottom: 4px;
              font-size: 0.9em;
            }
            .form-context.multi-line .field-value {
              width: 100%;
            }
            .field-updated {
              transition: background-color 0.3s ease-out;
              background-color: #d1fae5 !important; /* emerald-100 */
              animation: flash-green 1.5s ease-out;
            }
            @keyframes flash-green {
              0% { background-color: #d1fae5; }
              70% { background-color: #d1fae5; } 
              100% { background-color: transparent; }
            }
            /* Ensure resizing cursor applies globally */
            body.resizing {
              cursor: col-resize !important;
              user-select: none; /* Prevent text selection during resize */
            }
            body.resizing * {
              cursor: col-resize !important;
            }
            .response .form-context {
              /* Styles specifically for buttons within the preview/response area */
              margin: 8px 4px;
              max-width: 100%;
            }
          `}
        </style>
        <h2 className="text-2xl font-bold mb-6">Agent Panel Configuration</h2>
        
        {/* Examples Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Examples
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedExample}
            onChange={(e) => {
              const example = examples.find(ex => ex.name === e.target.value);
              if (example) {
                handleExampleSelect(example);
                setSelectedExample(e.target.value);
              }
            }}
          >
            <option value="">Select an example...</option>
            {examples.map((example) => (
              <option key={example.name} value={example.name}>
                {example.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Markdown Preview Section */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm relative">
          <h3 className="text-lg font-semibold mb-3">Response Preview</h3>
          {!selectedExample && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center p-4">
                <p className="text-gray-600 text-lg font-medium">Select an example to see the preview</p>
              </div>
            </div>
          )}
          <div className="response max-w-none prose dark:prose-invert">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            <br />
            {renderPreviewContent()}
            <br />
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response Pattern
            </label>
            <input
              type="text"
              id="responsepattern"
              value={buttonFormat}
              onChange={(e) => setButtonFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="[[aiLiteracySurvey]]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regex Pattern
            </label>
            <input
              type="text"
              id="regexpattern"
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="\[\[aiLiteracySurvey\]\]"
            />
          </div>

          <div>
            <div className="flex gap-4">
              <div className="w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Type
                </label>
                <select
                  id="responsetype"
                  value={responseType}
                  onChange={(e) => setResponseType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="button">Button</option>
                  <option value="callback">Callback</option>
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
              </div>
              <div className="w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style
                </label>
                <input
                  type="text"
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Style"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flags
                </label>
                <input
                  type="text"
                  id="flags"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  placeholder="Flags"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Callback
                </label>
                <input
                  type="text"
                  id="callback"
                  value={callback}
                  onChange={(e) => setCallback(e.target.value)}
                  placeholder="Callback"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex border-b border-gray-200 mb-2">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'markdown'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('markdown')}
              >
                Markdown
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'css'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('css')}
              >
                CSS
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'actionJson'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('actionJson')}
              >
                Action JSON
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'currentCss'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('currentCss')}
              >
                Current CSS (Local)
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'currentActionJson'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('currentActionJson')}
              >
                Current Actions JSON (Local)
              </button>
            </div>
            <textarea
              value={
                activeTab === 'markdown' ? markdown :
                activeTab === 'css' ? css :
                activeTab === 'actionJson' ? actionJson :
                activeTab === 'currentCss' ? currentCss :
                currentActionJson
              }
              onChange={(e) => {
                if (activeTab === 'markdown') setMarkdown(e.target.value);
                else if (activeTab === 'css') setCss(e.target.value);
                else if (activeTab === 'actionJson') setActionJson(e.target.value);
                else if (activeTab === 'currentCss') setCurrentCss(e.target.value);
                else setCurrentActionJson(e.target.value);
              }}
              id={activeTab === 'markdown' ? 'markdown' : activeTab === 'css' ? 'css' : ''}
              className="w-full p-2 border border-gray-300 rounded-md h-64 font-mono text-sm"
              placeholder={
                activeTab === 'markdown' ? 'Enter your markdown format here...' :
                activeTab === 'css' ? 'Enter your CSS here...' :
                activeTab === 'actionJson' ? 'Enter your action JSON here...' :
                activeTab === 'currentCss' ? 'Enter your current CSS here...' :
                'Enter your current actions JSON here...'
              }
            />
          </div>

          <button
            onClick={() => setIframeUrl(generateIframeUrl())}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Generate Iframe URL
          </button>

          {iframeUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Iframe URL
              </label>
              <input
                type="text"
                value={iframeUrl}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right side - Iframe */}
      <div className="w-1/3 border-l border-gray-200 overflow-hidden">
        <div className="p-2 border-b border-gray-200">
          <button
            onClick={() => {
              const iframe = document.querySelector('iframe');
              if (iframe) {
                iframe.src = iframe.src;
              }
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
          >
            Refresh
          </button>
        </div>
        <iframe
          src="https://app.llmasaservice.io/embedagent?id=c41b18de-d680-42a9-b186-994a019ab9ce&customer_id=&customer_email="
          width="100%"
          height="690"
          style={{ border: 'none' }}
          allow="clipboard-read *; clipboard-write *"
          title="Embedded Agent Panel"
        />
      </div>
    </div>
  );
} 