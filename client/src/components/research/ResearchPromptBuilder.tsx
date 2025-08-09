import React, { useState, useEffect } from 'react';
import { ChevronDown, Zap, Brain, Cpu, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { generateResearch } from '../../api/research';

interface ResearchPromptBuilderProps {
  onClose?: () => void;
}

export const ResearchPromptBuilder: React.FC<ResearchPromptBuilderProps> = ({ onClose }) => {
  const [selectedModel, setSelectedModel] = useState('claude');
  const [isGenerating, setIsGenerating] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [customInputs, setCustomInputs] = useState({});
  const [showCustomInput, setShowCustomInput] = useState({});
  const [copied, setCopied] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [processingMessage, setProcessingMessage] = useState('');
  const [promptSegments, setPromptSegments] = useState({
    business_unit: null,
    research_domain: null,
    analysis_method: null,
    output_format: null
  });

  const models = [
    { id: 'claude', name: 'CLAUDE', icon: Brain, color: 'rgb(255, 140, 0)' },
    { id: 'gpt4', name: 'GPT-4', icon: Cpu, color: 'rgb(0, 255, 157)' },
    { id: 'grok', name: 'GROK', icon: Zap, color: 'rgb(138, 43, 226)' }
  ];

  const segments = {
    business_unit: {
      title: 'Select Business Unit',
      icon: 'Building2',
      options: [
        { key: 'bedrock', display: 'Bedrock Truck Beds', prompt: 'truck bed manufacturing and accessories' },
        { key: 'circle_y', display: 'Circle Y Saddles', prompt: 'western saddle and leather goods manufacturing' },
        { key: 'horizon', display: 'Horizon Firearms', prompt: 'custom firearms and precision rifle manufacturing' },
        { key: 'wire_works', display: 'Wire Works', prompt: 'wire products and metal fabrication' },
        { key: 'precious_metals', display: 'TX Precious Metals', prompt: 'precious metals trading and investment' }
      ]
    },
    research_domain: {
      title: 'Research Domain',
      icon: 'Microscope',
      options: [
        { key: 'manufacturing', display: 'Manufacturing Optimization', prompt: 'lean manufacturing processes and production efficiency' },
        { key: 'quality', display: 'Quality & Automation', prompt: 'quality control systems and automated inspection' },
        { key: 'supply_chain', display: 'Supply Chain', prompt: 'supply chain optimization and inventory management' },
        { key: 'market', display: 'Market Analysis', prompt: 'market trends and competitive positioning' },
        { key: 'innovation', display: 'Product Innovation', prompt: 'new product development and R&D strategies' }
      ]
    },
    analysis_method: {
      title: 'Analysis Approach',
      icon: 'LineChart',
      options: [
        { key: 'predictive', display: 'Predictive Analytics', prompt: 'using predictive models to forecast' },
        { key: 'process_mining', display: 'Process Mining', prompt: 'analyzing workflow data to identify improvements in' },
        { key: 'ai_automation', display: 'AI Automation', prompt: 'implementing AI-driven automation for' },
        { key: 'benchmarking', display: 'Industry Benchmarking', prompt: 'comparing performance metrics against industry standards for' },
        { key: 'roi_analysis', display: 'ROI Analysis', prompt: 'calculating return on investment and cost-benefit analysis for' }
      ]
    },
    output_format: {
      title: 'Report Type',
      icon: 'FileText',
      options: [
        { key: 'executive', display: 'Executive Brief', prompt: 'Create a concise executive summary with key insights and recommendations' },
        { key: 'technical', display: 'Technical Report', prompt: 'Develop a detailed technical analysis with data visualizations' },
        { key: 'implementation', display: 'Implementation Plan', prompt: 'Design a step-by-step implementation roadmap with timelines' },
        { key: 'case_study', display: 'Case Study', prompt: 'Present findings as a comprehensive case study with real-world applications' }
      ]
    }
  };

  const templates = [
    {
      name: 'Manufacturing Excellence',
      icon: '🏭',
      config: {
        business_unit: 'bedrock',
        research_domain: 'manufacturing',
        analysis_method: 'process_mining',
        output_format: 'implementation'
      }
    },
    {
      name: 'Quality Automation',
      icon: '🤖',
      config: {
        business_unit: 'horizon',
        research_domain: 'quality',
        analysis_method: 'ai_automation',
        output_format: 'technical'
      }
    },
    {
      name: 'Market Intelligence',
      icon: '📊',
      config: {
        business_unit: 'precious_metals',
        research_domain: 'market',
        analysis_method: 'predictive',
        output_format: 'executive'
      }
    },
    {
      name: 'Supply Chain ROI',
      icon: '📦',
      config: {
        business_unit: 'circle_y',
        research_domain: 'supply_chain',
        analysis_method: 'roi_analysis',
        output_format: 'case_study'
      }
    }
  ];

  const applyTemplate = (template) => {
    setPromptSegments(template.config);
    setCustomInputs({});
    setShowCustomInput({});
  };

  const assemblePrompt = () => {
    const parts = ['Research Request:'];
    
    const getPromptText = (segmentKey, optionKey) => {
      const segment = segments[segmentKey];
      const option = segment.options.find(opt => opt.key === optionKey);
      return option ? option.prompt : customInputs[segmentKey] || optionKey;
    };
    
    if (promptSegments.business_unit) {
      parts.push(`Analyze ${getPromptText('business_unit', promptSegments.business_unit)}`);
    }
    if (promptSegments.research_domain) {
      parts.push(`focusing on ${getPromptText('research_domain', promptSegments.research_domain)}`);
    }
    if (promptSegments.analysis_method) {
      parts.push(`by ${getPromptText('analysis_method', promptSegments.analysis_method)}`);
    }
    if (promptSegments.output_format) {
      parts.push(`${getPromptText('output_format', promptSegments.output_format)}.`);
    }
    
    return parts.length > 1 ? parts.join(' ') : 'Select options to build your research prompt...';
  };

  const handleSegmentSelect = (segment, option) => {
    if (option === 'CUSTOM') {
      setShowCustomInput({ ...showCustomInput, [segment]: true });
    } else {
      setPromptSegments({ ...promptSegments, [segment]: option });
      setCustomInputs({ ...customInputs, [segment]: null });
      setShowCustomInput({ ...showCustomInput, [segment]: false });
      setCopied(false);
    }
  };

  const handleCustomSubmit = (segment, value) => {
    if (value.trim()) {
      setPromptSegments({ ...promptSegments, [segment]: 'CUSTOM' });
      setCustomInputs({ ...customInputs, [segment]: value });
    }
    setShowCustomInput({ ...showCustomInput, [segment]: false });
  };

  const pullLever = async () => {
    if (Object.values(promptSegments).some(v => v)) {
      setLeverPulled(true);
      setIsGenerating(true);
      setCopied(false);
      setStreamingContent('');
      setGeneratedContent('');
      setShowResults(false);
      
      setTimeout(() => {
        setLeverPulled(false);
      }, 500);
      
      // Processing messages based on model
      const processingMessages = {
        claude: [
          'Initializing Claude AI research assistant...',
          'Analyzing your research parameters...',
          'Accessing Kaspar Companies knowledge base...',
          'Generating comprehensive research report...',
          'Finalizing insights and recommendations...'
        ],
        gpt4: [
          'Connecting to GPT-4 research engine...',
          'Processing industry-specific requirements...',
          'Analyzing market data and trends...',
          'Synthesizing research findings...',
          'Preparing detailed analysis...'
        ],
        grok: [
          'Activating Grok AI systems...',
          'Scanning real-time data sources...',
          'Cross-referencing industry insights...',
          'Compiling research intelligence...',
          'Generating strategic recommendations...'
        ]
      };
      
      const messages = processingMessages[selectedModel] || processingMessages.claude;
      let messageIndex = 0;
      
      // Show processing messages
      const messageInterval = setInterval(() => {
        if (messageIndex < messages.length) {
          setProcessingMessage(messages[messageIndex]);
          messageIndex++;
        }
      }, 2000);
      
      try {
        const data = await generateResearch({
          model: selectedModel as 'claude' | 'gpt4' | 'grok',
          prompt: assemblePrompt()
        });
        
        clearInterval(messageInterval);
        setProcessingMessage('');
        setGeneratedContent(data.content);
        setIsGenerating(false);
        setShowResults(true);
      } catch (error) {
        clearInterval(messageInterval);
        console.error('Error generating research:', error);
        setProcessingMessage('');
        setGeneratedContent(`Error generating research: ${error.message || 'Please check your API configuration and try again.'}`);
        setIsGenerating(false);
        setShowResults(true);
      }
    }
  };

  const resetAll = () => {
    setPromptSegments({
      business_unit: null,
      research_domain: null,
      analysis_method: null,
      output_format: null
    });
    setCustomInputs({});
    setShowCustomInput({});
    setShowResults(false);
    setCopied(false);
    setGeneratedContent('');
  };

  const copyToClipboard = () => {
    const researchContent = `KASPAR AI RESEARCH REPORT

RESEARCH PARAMETERS:
${assemblePrompt()}

${generatedContent}
`;

    navigator.clipboard.writeText(researchContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const randomizeSelection = () => {
    const newSegments = {};
    Object.entries(segments).forEach(([key, data]) => {
      const options = data.options;
      const randomOption = options[Math.floor(Math.random() * options.length)];
      newSegments[key] = randomOption.key;
    });
    setPromptSegments(newSegments);
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto bg-gray-900 text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-orange-400">KASPAR AI RESEARCH LAB</h1>
          <p className="text-gray-400">Build AI-powered research for Kaspar Companies • Analyze subsidiaries • Generate insights</p>
        </div>

        {/* Model Selector */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border-2 border-gray-700">
          <h2 className="text-xl mb-4 text-gray-300">SELECT RESEARCH MODEL</h2>
          <div className="flex gap-4 justify-center">
            {models.map((model) => {
              const Icon = model.icon;
              const isSelected = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`
                    relative w-32 h-32 rounded-lg border-2 transition-all duration-300
                    ${isSelected 
                      ? 'border-gray-400 transform scale-105' 
                      : 'border-gray-600 hover:border-gray-500'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? `${model.color}20` : 'rgb(31, 41, 55)',
                    boxShadow: isSelected ? `0 0 30px ${model.color}50, inset 0 0 20px ${model.color}20` : 'none'
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon 
                      size={40} 
                      style={{ color: isSelected ? model.color : 'rgb(156, 163, 175)' }}
                      className="mb-2"
                    />
                    <span 
                      className="font-bold"
                      style={{ color: isSelected ? model.color : 'rgb(156, 163, 175)' }}
                    >
                      {model.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div 
                      className="absolute top-2 right-2 w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: model.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8 border-2 border-gray-700">
          <h3 className="text-sm text-gray-400 mb-3">QUICK START TEMPLATES</h3>
          <div className="flex gap-3 justify-center flex-wrap">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:border-gray-500 rounded transition-all flex items-center gap-2"
              >
                <span className="text-xl">{template.icon}</span>
                <span className="text-sm">{template.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Builder */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border-2 border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-gray-300">RESEARCH PROMPT BUILDER</h2>
            <div className="flex gap-2">
              <button
                onClick={randomizeSelection}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center gap-2 transition-colors"
              >
                <Sparkles size={16} />
                RANDOMIZE
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={16} />
                RESET
              </button>
            </div>
          </div>

          {Object.entries(segments).map(([segmentKey, segmentData]) => (
            <div key={segmentKey} className="mb-6">
              <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <span className="text-orange-400">{segmentKey.split('_').map((_, i) => i + 1).join('.')}</span>
                {segmentData.title.toUpperCase()}
              </h3>
              <div className="flex flex-wrap gap-3">
                {segmentData.options.map((option) => {
                  const isSelected = promptSegments[segmentKey] === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => handleSegmentSelect(segmentKey, option.key)}
                      className={`
                        px-4 py-3 rounded border-2 transition-all duration-200 flex-1 min-w-[180px] max-w-[220px]
                        ${isSelected
                          ? 'bg-orange-600 border-orange-400 transform scale-105 shadow-lg shadow-orange-600/30'
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-600'
                        }
                      `}
                      title={option.prompt}
                    >
                      {option.display.toUpperCase()}
                    </button>
                  );
                })}
                <button
                  onClick={() => handleSegmentSelect(segmentKey, 'CUSTOM')}
                  className={`
                    px-4 py-3 rounded border-2 transition-all duration-200 min-w-[180px] max-w-[220px]
                    ${promptSegments[segmentKey] === 'CUSTOM'
                      ? 'bg-blue-600 border-blue-400 transform scale-105 shadow-lg shadow-blue-600/30'
                      : 'bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-600'
                    }
                  `}
                >
                  + CUSTOM
                </button>
              </div>
              {showCustomInput[segmentKey] && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter custom value..."
                    className="flex-1 px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded focus:border-blue-400 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomSubmit(segmentKey, e.target.value);
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      handleCustomSubmit(segmentKey, input.value);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Assembled Prompt Preview */}
          <div className="mt-8 p-4 bg-gray-900 rounded-lg border-2 border-gray-700">
            <h3 className="text-sm text-gray-400 mb-2">ASSEMBLED PROMPT</h3>
            <p className="text-lg text-orange-300">
              {assemblePrompt()}
            </p>
          </div>
        </div>

        {/* Lever Mechanism */}
        <div className="flex justify-center mb-8">
          <button
            onClick={pullLever}
            disabled={!Object.values(promptSegments).some(v => v) || isGenerating}
            className={`
              relative w-64 h-32 rounded-lg transition-all duration-300
              ${leverPulled ? 'transform translate-y-4' : ''}
              ${!Object.values(promptSegments).some(v => v) 
                ? 'bg-gray-700 cursor-not-allowed' 
                : isGenerating
                ? 'bg-yellow-600 animate-pulse'
                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/50'
              }
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {isGenerating ? 'GENERATING...' : 'PULL TO GENERATE'}
                </div>
                <ChevronDown size={24} className={`mx-auto ${isGenerating ? 'animate-bounce' : ''}`} />
              </div>
            </div>
            {/* Lever Handle */}
            <div className={`
              absolute -top-8 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gray-600 rounded-t-full
              ${leverPulled ? 'translate-y-8' : ''}
              transition-transform duration-300
            `}>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full" />
            </div>
          </button>
        </div>

        {/* Processing Feedback */}
        {isGenerating && processingMessage && (
          <div className="mb-8 text-center animate-fade-in">
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-600 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin h-8 w-8 border-4 border-yellow-600 border-t-transparent rounded-full mr-3"></div>
                <h3 className="text-xl text-yellow-400">Research in Progress</h3>
              </div>
              <p className="text-lg text-gray-300 mb-2">{processingMessage}</p>
              <p className="text-sm text-gray-500">
                This may take 30-60 seconds depending on the complexity of your request.
                <br />
                Your comprehensive research report is being generated with citations and analysis.
              </p>
            </div>
          </div>
        )}

        {/* Results Area */}
        {showResults && (
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-orange-400 animate-fade-in">
            <h2 className="text-2xl mb-4 text-orange-400">KASPAR RESEARCH OUTPUT</h2>
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl mb-3">Generated by {selectedModel.toUpperCase()} Model</h3>
              <div className="mb-4 p-3 bg-gray-900 rounded">
                <p className="text-sm text-gray-400 mb-1">RESEARCH PARAMETERS:</p>
                <p className="text-orange-300">{assemblePrompt()}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {generatedContent}
                </p>
              </div>
              <div className="mt-6 flex gap-3 flex-wrap">
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded transition-all duration-200 flex items-center gap-2 shadow-lg
                    ${copied 
                      ? 'bg-green-600 hover:bg-green-700 shadow-green-600/30' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/50'
                    }`}
                  title="Copy research report to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="animate-check" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      COPY TO CLIPBOARD
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                >
                  REFINE PROMPT
                </button>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                  >
                    CLOSE
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes check-bounce {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-check {
          animation: check-bounce 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResearchPromptBuilder;