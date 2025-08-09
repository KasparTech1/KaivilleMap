/**
 * Circle Y Data Inclusion Component
 * UI for including Circle Y business data in research prompts
 */

import React, { useState, useEffect } from 'react';
import { 
  Checkbox, 
  FormControlLabel, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';

const CircleYDataInclusion = ({ 
  businessUnit, 
  researchDomains, 
  onDataInclusionChange,
  disabled = false 
}) => {
  const [includeData, setIncludeData] = useState(false);
  const [circleyConfig, setCircleyConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Check if Circle Y is selected
  const isCircleYSelected = businessUnit?.key === 'circle_y' || 
                           businessUnit?.text?.toLowerCase().includes('circle y');

  useEffect(() => {
    if (isCircleYSelected) {
      loadCircleYConfig();
    } else {
      setIncludeData(false);
      setSelectedDomains([]);
    }
  }, [isCircleYSelected]);

  useEffect(() => {
    // Auto-select relevant domains based on research domains
    if (circleyConfig && researchDomains && includeData) {
      const relevantDomains = matchResearchToDataDomains(researchDomains, circleyConfig.domains);
      setSelectedDomains(relevantDomains);
    }
  }, [researchDomains, circleyConfig, includeData]);

  const loadCircleYConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/research/circley/config');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load configuration');
      }
      
      setCircleyConfig(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading Circle Y config:', err);
    } finally {
      setLoading(false);
    }
  };

  const matchResearchToDataDomains = (researchDomains, dataDomains) => {
    const mappings = {
      'manufacturing': ['manufacturing_optimization'],
      'quality': ['quality_automation'],
      'supply_chain': ['supply_chain'],
      'market': ['market_analysis'],
      'sales': ['market_analysis'],
      'product': ['product_innovation']
    };

    const matched = new Set();
    researchDomains.forEach(domain => {
      const domainKey = domain.key || domain;
      const mapped = mappings[domainKey.toLowerCase()];
      if (mapped) {
        mapped.forEach(m => matched.add(m));
      }
    });

    return Array.from(matched);
  };

  const handleIncludeDataChange = (event) => {
    const checked = event.target.checked;
    setIncludeData(checked);
    
    onDataInclusionChange({
      includeCircleYData: checked,
      selectedDomains: checked ? selectedDomains : []
    });
  };

  const handleDomainToggle = (domainKey) => {
    const newSelection = selectedDomains.includes(domainKey)
      ? selectedDomains.filter(d => d !== domainKey)
      : [...selectedDomains, domainKey];
    
    setSelectedDomains(newSelection);
    
    onDataInclusionChange({
      includeCircleYData: includeData,
      selectedDomains: newSelection
    });
  };

  const handlePreviewQueries = async (domainKey) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/research/circley/domains/${domainKey}/queries`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load queries');
      }
      
      setPreviewData({ domain: domainKey, ...data });
      setPreviewDialog(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isCircleYSelected) {
    return null;
  }

  if (loading && !circleyConfig) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading Circle Y data options...</Typography>
      </Box>
    );
  }

  if (error && !circleyConfig) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!circleyConfig?.enabled) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        Circle Y database integration is not currently available.
      </Alert>
    );
  }

  return (
    <Box sx={{ my: 3 }}>
      <Accordion 
        expanded={includeData} 
        onChange={(e, expanded) => setIncludeData(expanded)}
        disabled={disabled}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeData}
                  onChange={handleIncludeDataChange}
                  disabled={disabled}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageIcon />
                  <Typography>Include Circle Y Business Data</Typography>
                  {includeData && selectedDomains.length > 0 && (
                    <Chip 
                      label={`${selectedDomains.length} domains`} 
                      size="small" 
                      color="primary" 
                    />
                  )}
                </Box>
              }
              sx={{ m: 0 }}
            />
            {circleyConfig?.connectionStatus?.connected && (
              <Tooltip title="Database connected">
                <CheckCircleIcon color="success" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          <Box sx={{ pl: 4 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select data domains to include real-time business metrics in your research. 
              The AI will use this data to provide specific insights for Circle Y operations.
            </Alert>

            <Typography variant="subtitle2" gutterBottom>
              Available Data Domains:
            </Typography>

            <List>
              {circleyConfig?.domains?.map((domain) => (
                <ListItem 
                  key={domain.key}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1,
                    bgcolor: selectedDomains.includes(domain.key) ? 'action.selected' : 'background.paper'
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={selectedDomains.includes(domain.key)}
                      onChange={() => handleDomainToggle(domain.key)}
                      disabled={disabled}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{domain.icon}</Typography>
                        <Typography>{domain.displayName}</Typography>
                        <Chip label={`${domain.queryCount} queries`} size="small" />
                      </Box>
                    }
                    secondary={domain.description}
                  />
                  <Button
                    size="small"
                    startIcon={<PreviewIcon />}
                    onClick={() => handlePreviewQueries(domain.key)}
                  >
                    Preview
                  </Button>
                </ListItem>
              ))}
            </List>

            {selectedDomains.length === 0 && includeData && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Please select at least one data domain to include business data in your research.
              </Alert>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Query Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewData?.name} - Available Queries
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {previewData?.description}
          </Typography>
          <List sx={{ mt: 2 }}>
            {previewData?.queries?.map((query) => (
              <ListItem key={query.key} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle2">{query.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {query.description}
                </Typography>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CircleYDataInclusion;