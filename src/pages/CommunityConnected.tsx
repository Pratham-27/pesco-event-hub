import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, ThumbsUp, User, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000, "Description must be less than 5000 characters"),
});

const CommunityConnected = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", description: "" });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch discussions
  const { data: discussions = [] } = useQuery({
    queryKey: ["discussions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_discussions")
        .select(`
          *,
          profiles:author_id (name, year)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create discussion mutation
  const createDiscussion = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const { error } = await supabase
        .from("community_discussions")
        .insert({
          author_id: user?.id,
          title: data.title,
          description: data.description,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      setNewPost({ title: "", description: "" });
      setShowNewPost(false);
      toast({
        title: "Success!",
        description: "Your event proposal has been posted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const validationResult = postSchema.safeParse(newPost);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    createDiscussion.mutate({
      title: validationResult.data.title,
      description: validationResult.data.description,
    });
  };

  if (!user || !profile) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Community Discussions
            </h1>
            <Button onClick={() => setShowNewPost(!showNewPost)} className="group">
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>
          <p className="text-lg text-muted-foreground">
            Share your ideas for future events and collaborate with fellow students
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-6 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.year} • {profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Post Form */}
        {showNewPost && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader>
              <CardTitle>Propose a New Event</CardTitle>
              <CardDescription>Share your idea with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a catchy title for your event"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {newPost.title.length}/200 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event idea, objectives, and what kind of support you need..."
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    rows={5}
                    maxLength={5000}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {newPost.description.length}/5000 characters
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createDiscussion.isPending}>
                    {createDiscussion.isPending ? "Posting..." : "Post Proposal"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewPost(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.map((discussion: any, index) => (
            <Card 
              key={discussion.id} 
              className="animate-fade-in hover:shadow-lg transition-shadow cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{discussion.profiles?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {discussion.profiles?.year} • {formatDate(discussion.created_at)}
                        </p>
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{discussion.title}</CardTitle>
                    <CardDescription className="text-base">{discussion.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    {discussion.likes} Likes
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    0 Replies
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CommunityConnected;
