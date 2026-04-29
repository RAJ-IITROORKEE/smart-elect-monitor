"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Mail, Clock, CheckCircle2, MessageSquare, RefreshCw, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: "new" | "read" | "responded";
}

export default function AdminContactsPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const url = filterStatus === "all" 
        ? "/api/contacts?limit=100" 
        : `/api/contacts?status=${filterStatus}&limit=100`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contact submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "new" | "read" | "responded") => {
    try {
      const response = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Marked as ${status}`,
        });
        fetchSubmissions();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSubmissions, 30000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "read":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "responded":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contact Requests</h2>
          <p className="text-sm text-muted-foreground">
            {submissions.length} {submissions.length === 1 ? "submission" : "submissions"} 
            {filterStatus !== "all" && ` (filtered: ${filterStatus})`}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchSubmissions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          All
        </Button>
        <Button
          variant={filterStatus === "new" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("new")}
        >
          New
        </Button>
        <Button
          variant={filterStatus === "read" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("read")}
        >
          Read
        </Button>
        <Button
          variant={filterStatus === "responded" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("responded")}
        >
          Responded
        </Button>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading submissions...
            </div>
          </CardContent>
        </Card>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No contact submissions yet</p>
              <p className="text-xs mt-1">Submissions will appear here when users contact you</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">{submission.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-3.5 w-3.5" />
                      <a 
                        href={`mailto:${submission.email}`}
                        className="hover:underline"
                      >
                        {submission.email}
                      </a>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {submission.message}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTimestamp(submission.timestamp)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {submission.status !== "read" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(submission.id, "read")}
                        >
                          Mark as Read
                        </Button>
                      )}
                      {submission.status !== "responded" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(submission.id, "responded")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          Mark as Responded
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
