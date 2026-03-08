import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, ShieldCheck, BarChart3, MessageSquare, ArrowRight, Building2, Clock } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "Easy Submission", desc: "Submit complaints with category selection and file attachments in seconds." },
  { icon: Clock, title: "Real-time Tracking", desc: "Track your complaint status from submission to resolution." },
  { icon: Building2, title: "Department Routing", desc: "Complaints are automatically assigned to the right department." },
  { icon: ShieldCheck, title: "Transparent Process", desc: "Every step is logged and visible for full accountability." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Comprehensive reports to improve university services." },
  { icon: GraduationCap, title: "Student-Centric", desc: "Built for BGC Trust University students and staff." },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-primary py-24 md:py-32">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container relative z-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-primary-foreground/90 mb-6">
            <GraduationCap className="h-4 w-4" /> BGC Trust University Bangladesh
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl leading-tight">
            Smart Complaint & Service Request System
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            A transparent, efficient platform for students to submit complaints and track resolutions across all university departments.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-white/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">System Features</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">Everything you need for efficient complaint management at your university.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Ready to Submit a Complaint?</h2>
          <p className="mt-3 text-muted-foreground">Register now and get your issues resolved quickly.</p>
          <Link to="/register">
            <Button size="lg" className="mt-8 gap-2">Register as Student <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">© 2026 BGC Trust University Bangladesh — Smart Complaint Management System</p>
          <p className="text-xs text-muted-foreground mt-1">CSE Department • Software Analysis & Design Project</p>
        </div>
      </footer>
    </div>
  );
}