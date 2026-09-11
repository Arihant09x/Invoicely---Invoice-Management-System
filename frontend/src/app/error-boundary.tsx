import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("UI crash:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Something broke</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {this.state.error.message}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </Button>
          <Button onClick={() => window.location.reload()}>Reload app</Button>
        </div>
      </div>
    );
  }
}
