# Deep Research & Web Access Configuration

## Overview
The Research Prompt Builder now includes deep research capabilities with real-time web access for all AI models, ensuring current and well-sourced research outputs.

## Features

### 1. **Claude 3.5 Sonnet**
- Latest model with enhanced research capabilities
- Increased token limit (8192) for comprehensive reports
- System prompt optimized for web-aware research
- Automatic source citation requirements

### 2. **GPT-4 Turbo**
- Latest GPT-4 Turbo model with web browsing
- Tool calling enabled for web search (when available)
- Optimized for current information retrieval
- Enhanced context window for detailed analysis

### 3. **Grok (xAI)**
- Built-in real-time web access
- Access to breaking news and social media trends
- Optimized for up-to-the-minute information
- Real-time market sentiment analysis

## Web Search Integration

### Optional Search APIs
For enhanced research capabilities, you can add these search API keys:

1. **Serper API** (Recommended)
   - Sign up at: https://serper.dev
   - Add to Railway: `SERPER_API_KEY=your_key`
   - Provides high-quality Google search results

2. **Bing Search API** (Alternative)
   - Get key from: https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/
   - Add to Railway: `BING_SEARCH_KEY=your_key`
   - Good alternative with Azure integration

### How It Works
1. When a research request is made, the system checks for available search APIs
2. If found, performs targeted searches for the research topic
3. Retrieves recent web results, news, and academic sources
4. Adds this context to the AI prompt for more informed responses
5. All models receive instructions to cite sources and include URLs

## Enhanced Prompt Structure

Every research request now includes:
- Current date awareness
- Instructions for web-based research
- Requirements for 5-10 credible sources
- Specific formatting with citations
- Date stamps for time-sensitive information
- URL requirements for all sources
- Structured output format:
  - Executive Summary
  - Detailed Analysis with inline citations
  - Current Market/Industry Status
  - Future Outlook and Recommendations
  - Sources and References section
  - AI disclaimer with generation date

## Model-Specific Capabilities

### Claude
- Instructed to access current web information
- Prioritizes recent sources (2024-2025)
- Cross-references multiple sources
- Provides dated citations

### GPT-4
- Web browsing tool enabled (if available in your OpenAI account)
- Searches for current information
- Real-time data analysis
- Industry trend tracking

### Grok
- Native real-time web access
- Social media sentiment analysis
- Breaking news integration
- Up-to-the-minute updates

## Configuration Steps

1. **Basic Setup** (Required)
   - Ensure AI model API keys are set in Railway
   - Models will use their built-in capabilities

2. **Enhanced Setup** (Optional but Recommended)
   - Add `SERPER_API_KEY` or `BING_SEARCH_KEY` to Railway
   - This provides additional web context to all models
   - Improves source quality and currentness

3. **Testing Web Access**
   - Use the `/api/research/status` endpoint to verify configuration
   - Test with queries requiring current information
   - Check that responses include recent dates and URLs

## Output Format

All research outputs now include:
- Multiple dated sources with URLs
- Clear citation format [1], [2], etc.
- "Sources and References" section
- Publication dates for all sources
- AI-generated disclaimer
- Generation timestamp
- Model identification

## Best Practices

1. **Query Design**
   - Include temporal context (e.g., "latest", "2024", "current")
   - Be specific about needing recent information
   - Request comparative analysis for trends

2. **Source Verification**
   - All outputs include source URLs for verification
   - Cross-reference critical data points
   - Check publication dates for currency

3. **Model Selection**
   - Use Grok for breaking news and real-time data
   - Use Claude for comprehensive analysis with citations
   - Use GPT-4 for balanced research with web browsing

## Troubleshooting

### No Web Results
- Check if search API keys are configured
- Verify keys are valid with remaining credits
- Models will still attempt to use their built-in capabilities

### Outdated Information
- Ensure prompts explicitly request current data
- Check that date context is being passed correctly
- Consider adding search API for enhanced results

### Missing Citations
- All models are instructed to provide citations
- If missing, the prompt enhancement may have failed
- Check logs for any errors in prompt processing