import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import ThemeProvider from './ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
