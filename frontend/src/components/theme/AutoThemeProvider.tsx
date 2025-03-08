import React, { ReactNode, useEffect } from 'react';

interface AutoThemeProviderProps {
  children: ReactNode;
}

const AutoThemeProvider: React.FC<AutoThemeProviderProps> = ({ children }) => {
  // Function to check if it's evening (between 6 PM and 6 AM)
  const isEvening = (): boolean => {
    const hours = new Date().getHours();
    return hours >= 18 || hours < 6;
  };

  // Apply the theme based on time
  const applyThemeByTime = () => {
    if (isEvening()) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  useEffect(() => {
    // Apply theme when component mounts
    applyThemeByTime();
    
    // Set up interval to check time every minute
    const interval = setInterval(applyThemeByTime, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
};

export default AutoThemeProvider;