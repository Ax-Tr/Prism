import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] w-full flex flex-col items-center justify-center p-8 bg-black/40 border border-red-500/20 rounded-2xl backdrop-blur-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            {this.props.fallbackTitle || 'Component Execution Anomaly'}
          </h3>

          <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message ||
              'A runtime exception was intercepted. Prism continuity protection prevented the application from halting.'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Component
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-sm font-medium flex items-center gap-2 border border-white/10 transition-all"
            >
              <Home className="w-4 h-4" />
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
