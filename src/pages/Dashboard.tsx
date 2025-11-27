import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  status: string;
  current_attendees: number;
  max_attendees: number;
}

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchEvents();
    fetchUserRegistrations();

    // Refetch when window regains focus
    const handleFocus = () => {
      fetchEvents();
      fetchUserRegistrations();
    };
    window.addEventListener('focus', handleFocus);

    // Set up realtime subscription for event changes
    const eventsChannel = supabase
      .channel('dashboard-events-changes')
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

    // Set up realtime subscription for registration changes
    const registrationsChannel = supabase
      .channel('dashboard-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations'
        },
        () => {
          fetchUserRegistrations();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(registrationsChannel);
    };
  }, [user]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const fetchUserRegistrations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setRegisteredEventIds(data.map(r => r.event_id));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show ALL events, not just registered ones
  const upcomingEvents = events.filter(e => e.status === "upcoming");
  const liveEvents = events.filter(e => e.status === "live");
  const pastEvents = events.filter(e => e.status === "completed" || e.status === "cancelled");
  
  // Count registered events for stats
  const registeredUpcoming = upcomingEvents.filter(e => registeredEventIds.includes(e.id)).length;
  const registeredLive = liveEvents.filter(e => registeredEventIds.includes(e.id)).length;
  const registeredPast = pastEvents.filter(e => registeredEventIds.includes(e.id)).length;

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground">Manage your events and registrations</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{registeredUpcoming}</div>
              <p className="text-xs text-muted-foreground">Registered / {upcomingEvents.length} total</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Events</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{registeredLive}</div>
              <p className="text-xs text-muted-foreground">Registered / {liveEvents.length} live now</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{registeredPast}</div>
              <p className="text-xs text-muted-foreground">Attended / {pastEvents.length} completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Events Tabs */}
        <Tabs defaultValue="live" className="animate-fade-in">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="live">Live Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4 mt-6">
            {liveEvents.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-2">No live events at the moment</p>
                <p className="text-sm text-muted-foreground">Check back later for live events</p>
              </Card>
            ) : (
              liveEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow border-primary/50 bg-primary/5">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {event.title}
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <Badge className="mt-2">{event.category}</Badge>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {registeredEventIds.includes(event.id) ? "Registered - Live Now" : "Live Now"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm">
                      Join Event
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )))}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingEvents.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-2">No upcoming events</p>
                <p className="text-sm text-muted-foreground">Check the Events page to see all available events</p>
              </Card>
            ) : (
              upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <Badge className="mt-2">{event.category}</Badge>
                    </div>
                    {registeredEventIds.includes(event.id) ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Registered
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Not Registered
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="destructive" size="sm">
                      Cancel Registration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-6">
            {pastEvents.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-2">No past events</p>
                <p className="text-sm text-muted-foreground">Completed events will appear here</p>
              </Card>
            ) : (
              pastEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {event.date}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <Badge className="mt-2">{event.category}</Badge>
                    </div>
                    {registeredEventIds.includes(event.id) ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Attended
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
