
import { ArrowRight, BookOpen, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { routeConfig } from "@/config/routes";

const Home = () => {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-16 pb-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
            MyProject Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about MyProject. Get started quickly with our comprehensive guides, API reference, and examples.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="h-12 px-8">
            <Link to={routeConfig.buildPath("getting-started")}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="h-12 px-8">
            <Link to={routeConfig.buildPath("api-reference")}>
              API Reference
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Comprehensive Guides</CardTitle>
            <CardDescription className="text-base">
              Step-by-step tutorials and guides to help you get the most out of MyProject.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Powerful Search</CardTitle>
            <CardDescription className="text-base">
              Find what you're looking for quickly with our full-text search functionality.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Quick Start</CardTitle>
            <CardDescription className="text-base">
              Get up and running in minutes with our quick start guide and examples.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Quick Links */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Popular Topics</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Link to={routeConfig.buildPath("getting-started")}>
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  Getting Started
                  <ArrowRight className="ml-auto h-4 w-4 opacity-60" />
                </CardTitle>
                <CardDescription className="text-base">
                  Learn the basics and set up your first project
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to={routeConfig.buildPath("api-reference")}>
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  API Reference
                  <ArrowRight className="ml-auto h-4 w-4 opacity-60" />
                </CardTitle>
                <CardDescription className="text-base">
                  Complete reference for all available endpoints
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to={routeConfig.buildPath("examples")}>
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  Examples
                  <ArrowRight className="ml-auto h-4 w-4 opacity-60" />
                </CardTitle>
                <CardDescription className="text-base">
                  Real-world examples and use cases
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to={routeConfig.buildPath("troubleshooting")}>
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  Troubleshooting
                  <ArrowRight className="ml-auto h-4 w-4 opacity-60" />
                </CardTitle>
                <CardDescription className="text-base">
                  Solutions to common issues and debugging tips
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
