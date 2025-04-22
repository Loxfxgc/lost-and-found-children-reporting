import React, { Component } from 'react';

/**
 * Error Boundary component to catch and handle errors in the React component tree
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary">
          <h1>Something went wrong.</h1>
          <p>The application encountered an unexpected error.</p>
          {this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details</summary>
              <p>{this.state.error.toString()}</p>
              <p>{this.state.errorInfo?.componentStack || ''}</p>
            </details>
          )}
          <button 
            onClick={this.handleReset}
            style={{
              marginTop: '20px',
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
} 