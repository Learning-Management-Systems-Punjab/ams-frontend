import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We apologize for the inconvenience. Please try refreshing the page
              or contact support if the problem persists.
            </p>
            {this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs font-mono text-gray-700 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
