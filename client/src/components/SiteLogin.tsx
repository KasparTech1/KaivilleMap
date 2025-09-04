import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { getAssetUrl } from '../config/assetUrls';

interface SiteLoginProps {
  onAuthenticated: () => void;
}

export const SiteLogin: React.FC<SiteLoginProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isDayMode = true; // Default to day mode for login

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Check password
    if (password === 'Bryan') {
      // Store authentication state
      sessionStorage.setItem('siteAuthenticated', 'true');
      
      setTimeout(() => {
        setIsLoading(false);
        onAuthenticated();
      }, 500);
    } else {
      setTimeout(() => {
        setError('Invalid password. Please try again.');
        setIsLoading(false);
        setPassword('');
      }, 500);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sky Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100" 
             style={{ height: '40%' }} />
        
        {/* Grass */}
        <div className="absolute left-0 right-0 bottom-0" style={{ top: '40%' }}>
          <svg className="absolute w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <path d="M0,20 Q300,5 600,15 T1200,10 L1200,800 L0,800 Z" 
                  fill="url(#grassGradient)" opacity="0.7" />
            <defs>
              <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#84cc16" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#65a30d" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20" />
      </div>

      {/* Login Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Welcome Sign SVG */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <img
            src={`${getAssetUrl('kai-welcome.svg')}?t=${Date.now()}`}
            alt="Welcome to Kaiville"
            className="w-full max-w-md mx-auto drop-shadow-2xl"
          />
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">Enter Password</h2>
                  <p className="text-sm text-gray-500 mt-1">Hint: City of Horizon</p>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter site password"
                  className="text-center"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !password}
              >
                {isLoading ? 'Verifying...' : 'Enter Kaiville'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};