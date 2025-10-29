import { useState, useEffect } from 'react';
import {
  getOrCreateVisitorToken,
  getVisitorProfile,
  updateVisitorProfile,
} from '../services/xanoService';

/**
 * Custom hook for visitor authentication
 * Manages visitor token, profile, and authentication state
 */
export const useVisitorAuth = () => {
  const [visitorToken, setVisitorToken] = useState(null);
  const [visitorProfile, setVisitorProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Initialize visitor on mount
  useEffect(() => {
    initializeVisitor();
  }, []);

  const initializeVisitor = async () => {
    try {
      setIsLoading(true);
      
      // Get or create visitor token
      const token = getOrCreateVisitorToken();
      setVisitorToken(token);

      // Try to load existing profile
      try {
        const profile = await getVisitorProfile(token);
        if (profile && profile.first_name) {
          setVisitorProfile(profile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Profile doesn't exist yet, that's okay
        console.log('No existing profile found');
      }
    } catch (error) {
      console.error('Failed to initialize visitor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Authenticate visitor with name and email
   * Creates or updates visitor profile
   */
  const authenticate = async (firstName, lastName, email) => {
    try {
      if (!visitorToken) {
        throw new Error('No visitor token available');
      }

      // Update profile in Xano
      const updatedProfile = await updateVisitorProfile(
        visitorToken,
        firstName,
        lastName
      );

      setVisitorProfile({
        ...updatedProfile,
        email: email, // Store email locally if needed
      });
      setIsAuthenticated(true);
      setShowAuthPrompt(false);

      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('Authentication failed:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Prompt visitor to authenticate
   * Returns a promise that resolves when authenticated
   */
  const requireAuth = () => {
    return new Promise((resolve, reject) => {
      if (isAuthenticated) {
        resolve(visitorProfile);
      } else {
        setShowAuthPrompt(true);
        
        // Set up a one-time listener for authentication
        const checkAuth = setInterval(() => {
          if (isAuthenticated) {
            clearInterval(checkAuth);
            resolve(visitorProfile);
          }
        }, 100);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkAuth);
          reject(new Error('Authentication timeout'));
        }, 300000);
      }
    });
  };

  /**
   * Clear visitor authentication
   */
  const logout = () => {
    localStorage.removeItem('visitor_token');
    setVisitorToken(null);
    setVisitorProfile(null);
    setIsAuthenticated(false);
  };

  return {
    visitorToken,
    visitorProfile,
    isAuthenticated,
    isLoading,
    showAuthPrompt,
    setShowAuthPrompt,
    authenticate,
    requireAuth,
    logout,
  };
};

export default useVisitorAuth;
