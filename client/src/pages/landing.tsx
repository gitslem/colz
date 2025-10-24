import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Users, Briefcase, Search, TrendingUp, MessageSquare } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-8 w-8 text-primary" />
              <span className="font-serif text-2xl font-bold">COLZ</span>
            </div>
            <Button asChild data-testid="button-login">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Connect. Collaborate. Create.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                COLZ is the platform where artists and labels discover opportunities, 
                showcase their work, and build meaningful creative partnerships.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" asChild data-testid="button-get-started">
                  <a href="/api/login">Get Started</a>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                  <a href="#features">Learn More</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
                Everything you need to collaborate
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful tools designed for the creative community
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">
                  Artist Profiles
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Showcase your skills, portfolio, and unique creative voice. 
                  Let your work speak for itself.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">
                  Opportunities
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Discover collaboration opportunities from labels and fellow artists. 
                  Find your next big project.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">
                  Smart Discovery
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Advanced filters help you find exactly what you're looking for. 
                  Genre, skills, location, and more.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">
                  Project Showcase
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Share your creative projects with the community. 
                  Build your reputation and attract opportunities.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">
                  Easy Applications
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Apply to opportunities with ease. Track your applications 
                  and manage responses all in one place.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">
                  For Artists & Labels
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Whether you're an artist or a label, COLZ provides the tools 
                  to connect and grow together.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
                Ready to start collaborating?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join COLZ today and connect with the creative community.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild data-testid="button-join-now">
                  <a href="/api/login">Join Now</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 COLZ. Connect. Collaborate. Create.
          </p>
        </div>
      </footer>
    </div>
  );
}
