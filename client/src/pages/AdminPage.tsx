import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SimpleAdminAuth } from '../components/cms/SimpleAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, FileText, Home, Map, Settings, LogOut } from 'lucide-react';
import { supabase } from '../config/supabase';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token is still valid
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('token', token)
        .single();

      if (data && !error) {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SimpleAdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Kaiville CMS Admin</h1>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Management</h2>
          <p className="text-gray-600">Select a section to edit content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Home Page Editor */}
          <Link to="/admin/home">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span>Home Page</span>
                </CardTitle>
                <CardDescription>
                  Edit welcome messages, hero content, and main page text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage the content displayed on the landing page
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Building Pages Editor */}
          <Link to="/admin/buildings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Map className="w-5 h-5 text-green-600" />
                  <span>Buildings</span>
                </CardTitle>
                <CardDescription>
                  Edit building descriptions and details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Update information for each building on the map
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Articles Editor */}
          <Link to="/admin/articles">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Articles</span>
                </CardTitle>
                <CardDescription>
                  Create and manage blog posts and articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Write new content and edit existing articles
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Site Settings */}
          <Link to="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Site Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure site-wide settings and metadata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Update site title, description, and other settings
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Edit Content</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Click on any section above to access the editor</li>
            <li>• Click on text elements to edit them inline</li>
            <li>• Changes are saved automatically when you click Save</li>
            <li>• All changes are tracked with revision history</li>
            <li>• Use Ctrl+S or Cmd+S to quickly save changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};