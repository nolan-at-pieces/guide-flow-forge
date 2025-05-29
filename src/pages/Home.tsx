import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  
  const { user, isAdmin, isEditor } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Welcome to Docs UI
      </h1>
      <p className="max-w-[700px] text-lg text-muted-foreground">
        Beautifully designed components that you can copy and paste into your apps.
        Free. Open Source. And MIT licensed.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => navigate('/getting-started')} size="lg">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => navigate('/api-reference')} size="lg">
          View API Docs
        </Button>
        
        {(isAdmin || isEditor) && user && (
          <Button variant="outline" onClick={() => navigate('/edit/new')} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Button>
        )}
      </div>

      <section className="container grid items-center justify-center gap-6 pt-20 pb-12 md:py-10">
        <div className="mx-auto grid w-full max-w-sm items-center space-y-2.5">
          <h3 className="text-2xl font-semibold">New Features</h3>
          <p className="text-muted-foreground">
            We're constantly adding new components and features to the site.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
