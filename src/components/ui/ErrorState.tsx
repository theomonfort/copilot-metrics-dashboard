'use client';
import { AlertTriangle, KeyRound, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message?: string;
  className?: string;
}

export default function ErrorState({ message, className }: ErrorStateProps) {
  const isAuthError = message?.includes('GITHUB_TOKEN') || message?.includes('401') || message?.includes('403');
  
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      {isAuthError ? (
        <>
          <KeyRound className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-md mb-4">
            Please configure your GitHub token in <code className="px-1.5 py-0.5 bg-[hsl(var(--accent))] rounded text-xs">.env.local</code>
          </p>
          <div className="bg-[hsl(var(--accent))] rounded-lg p-4 text-sm font-mono max-w-md">
            <p>GITHUB_TOKEN=ghp_your_token_here</p>
            <p>GITHUB_ORG=octodemo</p>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
            Required scopes: <code>read:org</code> or fine-grained with &quot;Organization Copilot metrics (read)&quot;
          </p>
        </>
      ) : (
        <>
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-md mb-4">
            {message || 'Failed to load data. Please try again.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/80 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </>
      )}
    </div>
  );
}
