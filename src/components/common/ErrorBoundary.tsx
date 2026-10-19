import React from 'react';

export class ErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div role="alert" className="p-6 space-y-4">
      <p>This screen could not be displayed. Your saved data has not been deleted.</p>
      <button onClick={() => this.setState({failed: false})}>Try again</button>
    </div> : this.props.children;
  }
}
