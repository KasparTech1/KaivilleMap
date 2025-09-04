import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

interface SiteLoginProps {
  onAuthenticated: () => void;
}

export const SiteLogin: React.FC<SiteLoginProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Check password
    if (password === 'Shiner2025') {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to KaivilleMap</CardTitle>
          <CardDescription>Please enter the password to access the site</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter site password"
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
              {isLoading ? 'Verifying...' : 'Enter Site'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};