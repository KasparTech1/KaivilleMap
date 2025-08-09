# Research Prompt Builder Setup Guide

## Overview
The Research Prompt Builder is an AI-powered tool that allows users to generate research reports for Kaspar Companies using Claude (Anthropic) or Grok (xAI) models.

## Environment Variables Setup

### Railway Configuration
Add the following environment variables to your Railway deployment:

1. **ANTHROPIC_KEY**
   - Your Anthropic API key for Claude
   - Get it from: https://console.anthropic.com/settings/keys

2. **XAI_KEY**
   - Your xAI API key for Grok
   - Get it from: https://x.ai/api

### Local Development
For local development, create a `.env` file in the `/server` directory:

```env
ANTHROPIC_KEY=your_anthropic_api_key_here
XAI_KEY=your_xai_api_key_here
```

## Usage

1. Navigate to the Research Center page at `/research`
2. Click the "AI Research Lab" button (orange button with sparkles icon)
3. Select your AI model (Claude or Grok)
4. Build your research prompt using the segments:
   - Business Unit (Bedrock, Circle Y, Horizon, etc.)
   - Research Domain (Manufacturing, Quality, Supply Chain, etc.)
   - Analysis Method (Predictive Analytics, AI Automation, etc.)
   - Report Type (Executive Brief, Technical Report, etc.)
5. Click "PULL TO GENERATE" to create your research report
6. Copy the generated content or refine your prompt

## Features

- **Quick Start Templates**: Pre-configured research scenarios
- **Custom Inputs**: Add custom values for any segment
- **Randomize**: Randomly select options for quick testing
- **Copy to Clipboard**: Easy export of generated research

## API Endpoints

- `POST /api/research/generate`
  - Body: `{ model: 'claude' | 'grok', prompt: string }`
  - Returns: `{ content: string, model: string, timestamp: string }`

## Troubleshooting

1. **"Failed to generate research" error**
   - Check that API keys are properly set in Railway
   - Verify API keys are valid and have credits

2. **Modal not opening**
   - Check browser console for errors
   - Ensure JavaScript is enabled

3. **Empty responses**
   - Check API rate limits
   - Verify prompt is being assembled correctly