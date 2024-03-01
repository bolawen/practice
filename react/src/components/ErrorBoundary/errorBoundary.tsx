import { Component, ErrorInfo, PropsWithChildren } from 'react';

type ErrorBoundaryProps = PropsWithChildren<{
  onError?: (error: Error, info: ErrorInfo) => void;
}>;

type ErrorBoundaryState = {
  didCatch: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, didCatch: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { error, didCatch: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props?.onError?.(error, errorInfo);
  }

  componentDidMount(): void {
    window.addEventListener(
      'error',
      event => {
        console.log('event error', event);
        event.preventDefault();
        this.setState({ error: event.error, didCatch: true });
        this.props?.onError?.(event.error, { componentStack: '' });
      },
      true
    );
    window.addEventListener(
      'rejectionhandled',
      event => {
        console.log('event rejectionhandled', event);
        event.preventDefault();
        this.setState({ error: event.reason, didCatch: true });
        this.props?.onError?.(event.reason, { componentStack: '' });
      },
      false
    );
    window.addEventListener(
      'unhandledrejection',
      event => {
        console.log('event unhandledrejection', event);
        event.preventDefault();
        this.setState({ error: event.reason, didCatch: true });
        this.props?.onError?.(event.reason, { componentStack: '' });
      },
      false
    );
  }

  render() {
    const { didCatch, error } = this.state;

    if (didCatch) {
      return (
        <div>
          <h2>Something went wrong:</h2>
          {error?.message}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
