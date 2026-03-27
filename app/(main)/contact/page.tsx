import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquareText } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-card to-muted/40 p-8 shadow-sm sm:p-10 animate-fade-up">
        <Badge className="mb-3 border border-primary/30 bg-primary/10 text-primary">
          <MessageSquareText className="mr-1.5 h-3.5 w-3.5" />
          Contact VoltEdge Team
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Contact & Collaboration</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          This page UI is ready. Contact workflow and backend submission integration are currently in progress.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2 animate-fade-up stagger-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Type your message" className="min-h-28" />
              </div>
              <Button type="button" className="w-full sm:w-auto" disabled>
                Send Message (in progress)
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>Direct Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:sagar_b@ece.iitr.ac.in"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              sagar_b@ece.iitr.ac.in
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
