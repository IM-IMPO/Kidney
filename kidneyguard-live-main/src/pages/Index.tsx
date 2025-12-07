import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Redirect to the kidney app
    window.location.href = "/kidney-app/index.html";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-xl text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
