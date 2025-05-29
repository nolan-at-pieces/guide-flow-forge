
import { ArrowRight, BookOpen, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
          MyProject Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about MyProject. Get started quickly with our comprehensive guides and API reference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/docs/getting-started">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/docs/api-reference">
              API Reference
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader>
            <BookOpen className="h-10 w-10 text-primary" />
            <CardTitle>Comprehensive Guides</CardTitle>
            <CardDescription>
              Step-by-step tutorials and guides to help you get the most out of MyProject.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Search className="h-10 w-10 text-primary" />
            <CardTitle>Powerful Search</CardTitle>
            <CardDescription>
              Find what you're looking for quickly with our full-text search functionality.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Zap className="h-10 w-10 text-primary" />
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Get up and running in minutes with our quick start guide and examples.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Quick Links */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Popular Topics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
              <CardDescription>
                Learn the basics and set up your first project
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">API Reference</CardTitle>
              <CardDescription>
                Complete reference for all available endpoints
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Examples</CardTitle>
              <CardDescription>
                Real-world examples and use cases
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Topics</CardTitle>
              <CardDescription>
                Deep dive into advanced features and concepts
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
