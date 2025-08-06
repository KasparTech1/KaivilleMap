import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Settings, AlertTriangle, CheckCircle, Clock, Users, Building, Gavel, ScrollText, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface PermitApplication {
  id: string;
  type: string;
  title: string;
  description: string;
  requesterName: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied' | 'under_review';
  priority: 'low' | 'medium' | 'high';
}

export const CityHallPage: React.FC = () => {
  const [applications, setApplications] = useState<PermitApplication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    requesterName: '',
    priority: 'medium' as const
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [filterBy, setFilterBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Keyboard event handler for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showForm) {
        setShowForm(false);
        setFormErrors({});
        setSubmitSuccess(false);
      }
    };

    if (showForm) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap - focus first input when modal opens
      const firstInput = document.querySelector('#permit-form-title')?.nextElementSibling?.querySelector('input, select, textarea');
      if (firstInput) {
        (firstInput as HTMLElement).focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showForm]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Load sample applications
    setApplications([
      {
        id: '1',
        type: 'tool-deployment',
        title: 'Deploy Custom Analytics Tool',
        description: 'Request to deploy a custom analytics dashboard for team performance tracking.',
        requesterName: 'Sarah Chen',
        requestDate: '2025-01-15',
        status: 'under_review',
        priority: 'high'
      },
      {
        id: '2',
        type: 'unvetted-tool',
        title: 'Use External API Integration',
        description: 'Permission to integrate with third-party weather API for location-based services.',
        requesterName: 'Mike Rodriguez',
        requestDate: '2025-01-12',
        status: 'approved',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'building-permit',
        title: 'Expand Innovation Plaza Lab',
        description: 'Request to add new maker space equipment and expand workspace capacity.',
        requesterName: 'Jordan Kim',
        requestDate: '2025-01-10',
        status: 'pending',
        priority: 'low'
      }
    ]);
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.type) {
      errors.type = 'Please select a permit type';
    }
    if (!formData.requesterName.trim()) {
      errors.requesterName = 'Please enter your name';
    }
    if (!formData.title.trim()) {
      errors.title = 'Please enter a request title';
    }
    if (!formData.description.trim()) {
      errors.description = 'Please provide a detailed description';
    } else if (formData.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newApplication: PermitApplication = {
        id: Date.now().toString(),
        type: formData.type,
        title: formData.title,
        description: formData.description,
        requesterName: formData.requesterName,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        priority: formData.priority
      };
      
      setApplications(prev => [newApplication, ...prev]);
      setFormData({ type: '', title: '', description: '', requesterName: '', priority: 'medium' });
      setFormErrors({});
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(false);
      }, 2000);
    }, 1000);
  };

  const getStatusIcon = (status: PermitApplication['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: PermitApplication['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600 text-white font-medium';
      case 'denied':
        return 'bg-red-600 text-white font-medium';
      case 'under_review':
        return 'bg-blue-600 text-white font-medium';
      default:
        return 'bg-gray-600 text-white font-medium';
    }
  };

  const getPriorityColor = (priority: PermitApplication['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600 text-white font-medium';
      case 'medium':
        return 'bg-yellow-600 text-white font-medium';
      default:
        return 'bg-gray-500 text-white font-medium';
    }
  };

  const permitTypes = [
    { value: 'tool-deployment', label: 'Custom Tool Deployment', icon: Settings },
    { value: 'unvetted-tool', label: 'Unvetted Tool Usage', icon: Shield },
    { value: 'building-permit', label: 'Building/Space Modification', icon: Building },
    { value: 'data-access', label: 'Special Data Access', icon: FileText },
    { value: 'process-change', label: 'Process/Workflow Change', icon: Gavel },
    { value: 'vendor-approval', label: 'New Vendor/Partner', icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="no-underline">
                <h1 className="text-2xl text-[#1f4e79] font-serif font-bold hover:text-[#D4AF37] transition cursor-pointer">Kaiville</h1>
              </Link>
              <nav className="ml-10 hidden md:block">
                <ul className="flex space-x-8">
                  <li>
                    <Link to="/" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      Map
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/heritage_center" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (1) Stewardship Hall
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/learning_lodge" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (2) SKILLS Academy
                    </Link>
                  </li>
                  <li>
                    <span className="text-[#1f4e79] font-bold border-b-2 border-[#D4AF37] pb-1">
                      (3) City Hall
                    </span>
                  </li>
                  <li>
                    <Link to="/building/celebration_station" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (4) Innovation Plaza
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/trading_post" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (5) Trading Post
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90">
                  Return to Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="h-[400px] relative overflow-hidden bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="container mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between relative z-10">
          <div className="max-w-5xl text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-serif text-white mb-4 font-bold">
              City Hall
            </h1>
            <div className="bg-black bg-opacity-20 rounded-lg px-4 py-2 inline-block mb-4 lg:mb-6">
              <h2 className="text-2xl lg:text-3xl font-serif text-[#D4AF37]">
                Permits & Approvals Center
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-white italic font-serif max-w-3xl mx-auto lg:mx-0">
              Submit applications for custom tools, unvetted resources, building modifications, and special permissions
            </p>
          </div>
          <div className="mt-6 lg:mt-0 lg:block relative">
            <Building className="h-[150px] w-[150px] text-[#D4AF37] drop-shadow-2xl mx-auto" />
          </div>
        </div>
      </div>

      {/* Permit Types Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Available Permits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {permitTypes.map((permit, index) => {
                const Icon = permit.icon;
                return (
                  <Card key={index} className="bg-white p-6 hover:shadow-xl transition border-2 hover:border-[#D4AF37]">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-[#1f4e79] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl text-[#1f4e79] font-bold">{permit.label}</h3>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-[#D4AF37] text-[#1f4e79] hover:bg-[#D4AF37]/90 text-lg px-8 py-4"
              >
                Submit New Application
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="permit-form-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setFormErrors({});
              setSubmitSuccess(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 id="permit-form-title" className="text-2xl font-serif text-[#1f4e79]">New Permit Application</h3>
                <Button 
                  onClick={() => setShowForm(false)} 
                  variant="outline" 
                  size="sm"
                  aria-label="Close permit application form"
                >
                  ✕
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permit Type *
                  </label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => {
                      setFormData({...formData, type: value});
                      if (formErrors.type) {
                        setFormErrors({...formErrors, type: ''});
                      }
                    }}
                    aria-label="Select permit type"
                  >
                    <SelectTrigger className={formErrors.type ? 'form-field-error' : ''}>
                      <SelectValue placeholder="Select permit type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {permitTypes.map((permit) => (
                        <SelectItem key={permit.value} value={permit.value}>
                          {permit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.type && (
                    <div className="error-message">
                      <span>⚠</span> {formErrors.type}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requester Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.requesterName}
                    onChange={(e) => {
                      setFormData({...formData, requesterName: e.target.value});
                      if (formErrors.requesterName) {
                        setFormErrors({...formErrors, requesterName: ''});
                      }
                    }}
                    placeholder="Your full name"
                    aria-label="Requester name"
                    className={formErrors.requesterName ? 'form-field-error' : ''}
                    required
                  />
                  {formErrors.requesterName && (
                    <div className="error-message">
                      <span>⚠</span> {formErrors.requesterName}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({...formData, title: e.target.value});
                      if (formErrors.title) {
                        setFormErrors({...formErrors, title: ''});
                      }
                    }}
                    placeholder="Brief title describing your request"
                    aria-label="Request title"
                    className={formErrors.title ? 'form-field-error' : ''}
                    required
                  />
                  {formErrors.title && (
                    <div className="error-message">
                      <span>⚠</span> {formErrors.title}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description * <span className="text-xs text-gray-500">(min. 20 characters)</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({...formData, description: e.target.value});
                      if (formErrors.description) {
                        setFormErrors({...formErrors, description: ''});
                      }
                    }}
                    placeholder="Provide detailed information about your request, including purpose, benefits, and any technical requirements..."
                    aria-label="Detailed description"
                    className={formErrors.description ? 'form-field-error' : ''}
                    rows={6}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/20 minimum characters
                  </div>
                  {formErrors.description && (
                    <div className="error-message">
                      <span>⚠</span> {formErrors.description}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {submitSuccess && (
                  <div className="success-message bg-green-50 p-4 rounded-lg border border-green-200">
                    <span>✓</span> Application submitted successfully!
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    onClick={() => {
                      setShowForm(false);
                      setFormErrors({});
                      setSubmitSuccess(false);
                    }} 
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner mr-2"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications Section */}
      <div className="py-16 bg-[#F5F5DC]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl text-[#1f4e79] text-center mb-8 font-serif">Recent Applications</h2>
            
            {/* Sorting and Filtering Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="date">Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by type</label>
                <select 
                  value={filterBy} 
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Types</option>
                  {permitTypes.map((permit) => (
                    <option key={permit.value} value={permit.value}>{permit.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {applications
                .filter(app => filterBy === '' || app.type === filterBy)
                .sort((a, b) => {
                  let comparison = 0;
                  switch (sortBy) {
                    case 'date':
                      comparison = new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
                      break;
                    case 'priority':
                      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                      comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
                      break;
                    case 'status':
                      comparison = a.status.localeCompare(b.status);
                      break;
                  }
                  return sortOrder === 'asc' ? comparison : -comparison;
                })
                .map((app) => (
                <Card key={app.id} className="bg-white p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(app.status)}
                        <h3 className="text-lg font-semibold text-[#1f4e79]">{app.title}</h3>
                        <span 
                          className={`px-3 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}
                          aria-label={`Status: ${app.status.replace('_', ' ')}`}
                        >
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span 
                          className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(app.priority)}`}
                          aria-label={`Priority: ${app.priority}`}
                        >
                          {app.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{app.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {app.requesterName}
                        </span>
                        <span className="flex items-center">
                          <ScrollText className="w-4 h-4 mr-1" />
                          {permitTypes.find(p => p.value === app.type)?.label}
                        </span>
                        <span>{app.requestDate}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#1f4e79] font-bold text-2xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-[#1f4e79] mb-2">Submit Application</h3>
                <p className="text-gray-700">Fill out the permit application with detailed information about your request.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#1f4e79] font-bold text-2xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-[#1f4e79] mb-2">Review Process</h3>
                <p className="text-gray-700">Our team reviews your application for compliance, security, and feasibility.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#1f4e79] font-bold text-2xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-[#1f4e79] mb-2">Decision & Implementation</h3>
                <p className="text-gray-700">Receive approval/denial decision and proceed with authorized implementation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl mb-4 font-serif font-bold text-[#D4AF37]">City Hall</h3>
              <p className="text-gray-400">
                Ensuring secure, compliant, and efficient operations through proper permitting processes.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Services</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Tool Deployment Permits</span></li>
                <li><span className="text-gray-400">Usage Approvals</span></li>
                <li><span className="text-gray-400">Building Modifications</span></li>
                <li><span className="text-gray-400">Process Changes</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition">
                    Map
                  </Link>
                </li>
                <li>
                  <Link to="/building/heritage_center" className="text-gray-400 hover:text-white transition">
                    Stewardship Hall
                  </Link>
                </li>
                <li>
                  <Link to="/building/learning_lodge" className="text-gray-400 hover:text-white transition">
                    SKILLS Academy
                  </Link>
                </li>
                <li>
                  <Link to="/building/city_hall" className="text-gray-400 hover:text-white transition">
                    City Hall
                  </Link>
                </li>
                <li>
                  <Link to="/building/celebration_station" className="text-gray-400 hover:text-white transition">
                    Innovation Plaza
                  </Link>
                </li>
                <li>
                  <Link to="/building/trading_post" className="text-gray-400 hover:text-white transition">
                    Trading Post
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Contact</h3>
              <p className="text-gray-400">
                © 2025 Kaspar Companies. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};