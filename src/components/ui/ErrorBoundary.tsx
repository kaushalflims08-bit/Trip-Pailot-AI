import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl glass-card border border-red-500/30 text-center my-4 max-w-lg mx-auto">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            {this.props.fallbackTitle || 'Component encountered a temporary issue'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Don't worry, the rest of TripPilot AI is running smoothly.
          </p>
          <Button
            size="sm"
            variant="outline"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
