// PDFErrorBoundary.jsx
import React from "react";

class PDFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("PDF render failed", { error, info, data: this.props.debugData });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-sm text-red-600">
            Could not render PDF preview. Try downloading instead.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default PDFErrorBoundary;