import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ThumbsUp, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import CollegeHeader from "@/components/CollegeHeader";
import Navigation from "@/components/Navigation";
import GoBackButton from "@/components/GoBackButton";

interface Discussion {
  id: string;
  title: string;
  description: string;
  author_id: string;
  likes: number;
  status: string;
  created_at: string;
  author?: {
    name: string;
    email: string;
  };
}

const CommunityModeration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (error || !data) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchDiscussions();
  };

  const fetchDiscussions = async () => {
    setLoading(true);
    
    let query = supabase
      .from("community_discussions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data: discussionsData, error } = await query;

    if (error) {
      console.error("Error fetching discussions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch community discussions.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch author profiles
    const authorIds = discussionsData?.map(d => d.author_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", authorIds);

    // Combine data
    const combined = discussionsData?.map(disc => ({
      ...disc,
      author: profiles?.find(p => p.id === disc.author_id)
    })) || [];

    setDiscussions(combined);
    setLoading(false);
  };

  const updateStatus = async (discussionId: string, newStatus: string) => {
    const { error } = await supabase
      .from("community_discussions")
      .update({ status: newStatus })
      .eq("id", discussionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Discussion marked as ${newStatus}.`,
      });
      fetchDiscussions();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500 text-white gap-1"><CheckCircle className="w-3 h-3" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      case "under_review":
        return <Badge variant="secondary" className="gap-1"><AlertCircle className="w-3 h-3" />Under Review</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <GoBackButton />
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Moderation</h1>
          <p className="text-muted-foreground">Review and manage student suggestions and event ideas</p>
        </div>

        <div className="mb-6 flex gap-4 items-center">
          <Select value={filterStatus} onValueChange={(value) => {
            setFilterStatus(value);
            setTimeout(fetchDiscussions, 0);
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suggestions</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {discussions.length} suggestion{discussions.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="grid gap-4">
          {discussions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No suggestions found</h3>
                <p className="text-muted-foreground">
                  {filterStatus === "all" 
                    ? "No community suggestions yet" 
                    : `No ${filterStatus} suggestions`}
                </p>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card key={discussion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{discussion.title}</CardTitle>
                        {getStatusBadge(discussion.status)}
                      </div>
                      <CardDescription className="text-base mb-2">
                        {discussion.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>By: {discussion.author?.name || "Unknown"}</span>
                        <span>•</span>
                        <span>{discussion.author?.email}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {discussion.likes} likes
                        </span>
                        <span>•</span>
                        <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {discussion.status !== "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(discussion.id, "accepted")}
                          className="text-green-600 hover:text-green-700"
                        >
                          Accept
                        </Button>
                      )}
                      {discussion.status !== "under_review" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(discussion.id, "under_review")}
                        >
                          Review
                        </Button>
                      )}
                      {discussion.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(discussion.id, "rejected")}
                          className="text-red-600 hover:text-red-700"
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default CommunityModeration;
