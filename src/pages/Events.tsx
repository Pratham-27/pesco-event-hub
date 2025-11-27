import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
import GoBackButton from "@/components/GoBackButton";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  current_attendees: number;
  max_attendees: number;
  status: string;
  featured: boolean;
  registration_open: boolean;
}

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = ["all", "Technical", "Competition", "Workshop", "Cultural", "Industrial Visit"];

  useEffect(() => {
    fetchEvents();

    // Refetch when window regains focus
    const handleFocus = () => fetchEvents();
    window.addEventListener('focus', handleFocus);

    // Set up realtime subscription for event changes
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  };

  const upcomingEvents = events.filter((event) => 
    event.status === "upcoming" || event.status === "live"
  );

  const pastEvents = events.filter((event) => 
    event.status === "completed" || event.status === "cancelled"
  );

  const filteredUpcomingEvents = upcomingEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPastEvents = pastEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <GoBackButton />
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            All Events
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover and register for upcoming events at PESCOP
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Upcoming Events Section */}
            {filteredUpcomingEvents.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in">
                  Upcoming Events
                </h2>
                <div className="mb-6 text-sm text-muted-foreground animate-fade-in">
                  Showing {filteredUpcomingEvents.length} upcoming event{filteredUpcomingEvents.length !== 1 ? "s" : ""}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUpcomingEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <EventCard {...event} onRegistrationChange={fetchEvents} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events Section */}
            {filteredPastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in">
                  Past Events
                </h2>
                <div className="mb-6 text-sm text-muted-foreground animate-fade-in">
                  Showing {filteredPastEvents.length} past event{filteredPastEvents.length !== 1 ? "s" : ""}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPastEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <EventCard {...event} onRegistrationChange={fetchEvents} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Events Found */}
            {filteredUpcomingEvents.length === 0 && filteredPastEvents.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Events;
