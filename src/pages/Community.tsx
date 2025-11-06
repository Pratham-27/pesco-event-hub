import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, User, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Discussion {
  id: string;
  author: string;
  year: string;
  title: string;
  description: string;
  likes: number;
  replies: number;
  date: string;
}

const mockDiscussions: Discussion[] = [
  {
    id: "1",
    author: "Rahul Patil",
    year: "TY",
    title: "Web Development Workshop",
    description: "Would love to organize a workshop on modern web development with React and Node.js. Looking for interested students!",
    likes: 23,
    replies: 8,
    date: "2 days ago",
  },
  {
    id: "2",
    author: "Priya Sharma",
    year: "SY",
    title: "Environmental Awareness Campaign",
    description: "Planning an event to raise awareness about environmental issues. Need volunteers and ideas for activities.",
    likes: 45,
    replies: 15,
    date: "1 week ago",
  },
];

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", description: "" });

  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (!stored) {
      navigate("/login");
    } else {
      setUserData(JSON.parse(stored));
    }
  }, [navigate]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title || !newPost.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const discussion: Discussion = {
      id: Date.now().toString(),
      author: userData.name,
      year: userData.year,
      title: newPost.title,
      description: newPost.description,
      likes: 0,
      replies: 0,
      date: "Just now",
    };

    setDiscussions([discussion, ...discussions]);
    setNewPost({ title: "", description: "" });
    setShowNewPost(false);
    
    toast({
      title: "Success!",
      description: "Your event proposal has been posted",
    });
  };

  if (!userData) return null;

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
                <h3 className="font-semibold">{userData.name}</h3>
                <p className="text-sm text-muted-foreground">{userData.year} • {userData.email}</p>
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event idea, objectives, and what kind of support you need..."
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    rows={5}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Post Proposal</Button>
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
          {discussions.map((discussion, index) => (
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
                        <p className="font-semibold">{discussion.author}</p>
                        <p className="text-xs text-muted-foreground">{discussion.year} • {discussion.date}</p>
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
                    {discussion.replies} Replies
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

export default Community;
