
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { user, isAdmin, isEditor } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Your Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Beautiful, fast, and modern documentation for your project
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link to="/docs/getting-started">Get Started</Link>
        </Button>
        
        {!user && (
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
        
        {(isAdmin || isEditor) && (
          <Button asChild variant="outline" size="lg">
            <Link to="/admin">Admin Panel</Link>
          </Button>
        )}
      </div>

      {user && (
        <div className="text-sm text-muted-foreground">
          Welcome back, {user.email}!
        </div>
      )}
    </div>
  );
};

export default Home;
