
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null during server-side rendering and initial client-side mount
    // to avoid hydration mismatch if the theme is loaded from localStorage.
    return <div style={{ width: '2.25rem', height: '2.25rem' }} />; // Matches Button size="icon"
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Icons.Moon className="h-5 w-5" />
      ) : (
        <Icons.Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
