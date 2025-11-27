import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, User, Plus, Megaphone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AnnouncementCard from "@/components/AnnouncementCard";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ 
    title: "", 
    message: "", 
    link: "", 
    eventId: "", 
    isImportant: false 
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      checkAdminStatus();
      // Load last visit timestamp from localStorage
      const stored = localStorage.getItem(`lastVisit_${user.id}`);
      setLastVisit(stored);
    }
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch announcements
  const { data: announcements = [], isLoading: announcementsLoading, error: announcementsError, refetch: refetchAnnouncements } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          profiles:created_by (name),
          events:event_id (title)
        `)
        .order("is_important", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Announcements fetch error:", error);
        throw error;
      }
      return data || [];
    },
    staleTime: 30000,
    retry: 1,
  });

  // Fetch events for announcement form
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["events-for-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .in("status", ["upcoming", "live"])
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    staleTime: 30000,
  });

  // Fetch discussions
  const { data: discussions = [], isLoading: discussionsLoading } = useQuery({
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
    staleTime: 30000,
    refetchOnWindowFocus: false,
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

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    setSavingAnnouncement(true);

    try {
      const announcementData = {
        title: newAnnouncement.title.trim(),
        message: newAnnouncement.message.trim(),
        link: newAnnouncement.link.trim() || null,
        event_id: newAnnouncement.eventId || null,
        is_important: newAnnouncement.isImportant,
        created_by: user.id,
      };

      const { error } = await supabase
        .from("announcements")
        .insert([announcementData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      setNewAnnouncement({
        title: "",
        message: "",
        link: "",
        eventId: "",
        isImportant: false,
      });
      setShowNewAnnouncement(false);
      refetchAnnouncements();
    } catch (error: any) {
      console.error("Announcement error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Announcement deleted",
      });
      refetchAnnouncements();
    }
  };

  const handleAnnouncementChange = () => {
    refetchAnnouncements();
  };

  // Mark current time as last visit when user views announcements
  const markAnnouncementsViewed = () => {
    if (user) {
      const now = new Date().toISOString();
      localStorage.setItem(`lastVisit_${user.id}`, now);
      setLastVisit(now);
    }
  };

  const isNewAnnouncement = (createdAt: string) => {
    if (!lastVisit) return true;
    return new Date(createdAt) > new Date(lastVisit);
  };

  if (!user) return null;

  if (profileLoading || announcementsLoading || discussionsLoading) {
    return <LoadingSpinner />;
  }

  // Handle announcements error gracefully
  if (announcementsError) {
    console.error("Failed to load announcements:", announcementsError);
  }

  const isProfileIncomplete = !profile || !profile.name || !profile.mobile || !profile.year || !profile.semester || !profile.course;

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

  const newAnnouncementsCount = announcements.filter(a => isNewAnnouncement(a.created_at)).length;

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Profile Incomplete Warning */}
        {isProfileIncomplete && (
          <Card className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Complete Your Profile</h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                    To get the full experience and have your suggestions properly attributed, please complete your profile information.
                  </p>
                  <Button onClick={() => navigate("/profile")} size="sm" variant="outline" className="border-orange-500">
                    Complete Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Community Hub
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Stay updated with announcements and share your ideas
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {profile && (
          <Card className="mb-6 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{profile.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.year || "Not specified"} • {user?.email || profile.email || "No email"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Announcements and Student Posts */}
        <Tabs defaultValue="announcements" className="space-y-6" onValueChange={(value) => {
          if (value === "announcements") {
            markAnnouncementsViewed();
          }
        }}>
          <TabsList className="grid w-full max-w-2xl grid-cols-2">
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="w-4 h-4" />
              Announcements
              {newAnnouncementsCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground px-2 py-0">
                  {newAnnouncementsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Student Posts
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Official Announcements</h2>
              {isAdmin && (
                <Button onClick={() => setShowNewAnnouncement(!showNewAnnouncement)} className="group">
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              )}
            </div>

            {/* New Announcement Form */}
            {isAdmin && showNewAnnouncement && (
              <Card className="mb-6 animate-fade-in">
                <CardHeader>
                  <CardTitle>Create New Announcement</CardTitle>
                  <CardDescription>Share important updates with all students</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ann-title">Title</Label>
                      <Input
                        id="ann-title"
                        placeholder="Announcement title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        maxLength={200}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        {newAnnouncement.title.length}/200 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ann-message">Message</Label>
                      <Textarea
                        id="ann-message"
                        placeholder="Write your announcement message here..."
                        value={newAnnouncement.message}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                        rows={5}
                        maxLength={2000}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        {newAnnouncement.message.length}/2000 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ann-link">Link (Optional)</Label>
                      <Input
                        id="ann-link"
                        type="url"
                        placeholder="https://example.com"
                        value={newAnnouncement.link}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, link: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ann-event">Related Event (Optional)</Label>
                      <Select
                        value={newAnnouncement.eventId}
                        onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, eventId: value })}
                      >
                        <SelectTrigger id="ann-event">
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {events.map((event: any) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="ann-important" className="cursor-pointer">
                          Mark as Important
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Important announcements are highlighted and pinned
                        </p>
                      </div>
                      <Switch
                        id="ann-important"
                        checked={newAnnouncement.isImportant}
                        onCheckedChange={(checked) => 
                          setNewAnnouncement({ ...newAnnouncement, isImportant: checked })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={savingAnnouncement}>
                        {savingAnnouncement ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Announcement"
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowNewAnnouncement(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {announcementsError ? (
              <Card className="p-8 text-center border-destructive/50">
                <Megaphone className="w-12 h-12 mx-auto mb-3 text-destructive" />
                <p className="text-destructive font-semibold">Failed to load announcements</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please try refreshing the page
                </p>
                <Button 
                  onClick={() => refetchAnnouncements()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Retry
                </Button>
              </Card>
            ) : announcements.length === 0 ? (
              <Card className="p-8 text-center">
                <Megaphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No announcements yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check back later for important updates
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement: any, index) => (
                  <div
                    key={announcement.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <AnnouncementCard
                      id={announcement.id}
                      title={announcement.title}
                      message={announcement.message}
                      link={announcement.link}
                      eventId={announcement.event_id}
                      eventTitle={announcement.events?.title}
                      isImportant={announcement.is_important}
                      createdAt={announcement.created_at}
                      createdBy={announcement.created_by}
                      authorName={announcement.profiles?.name}
                      isAdmin={isAdmin}
                      onEdit={setEditingAnnouncement}
                      onDelete={handleDeleteAnnouncement}
                    />
                    {isNewAnnouncement(announcement.created_at) && (
                      <Badge className="mt-2 bg-accent text-accent-foreground">
                        New
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Student Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Student Event Proposals</h2>
              <Button onClick={() => setShowNewPost(!showNewPost)} className="group">
                <Plus className="w-4 h-4 mr-2" />
                New Proposal
              </Button>
            </div>

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
            {discussions.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No proposals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to propose an event idea!
                </p>
              </Card>
            ) : (
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
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CommunityConnected;
