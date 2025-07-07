import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useApplicationContext } from '../contexts/ApplicationContext';
import { useStaticLingo } from '../hooks/useStaticLingo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  renderErrorUI() {
    // Use a hook in a wrapper function
    const { state: appState } = useApplicationContext();
    const [title, message, refresh, details] = useStaticLingo(
      [
        'Something went wrong',
        'We encountered an unexpected error. Please try refreshing the page.',
        'Refresh Page',
        'Error Details (Development)'
      ],
      'en',
      appState.language
    );
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{refresh}</span>
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                {details}
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  public render() {
    if (this.state.hasError) {
      // Render error UI with translation
      return <this.renderErrorUI />;
    }
    return this.props.children;
  }
}