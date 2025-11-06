import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const registeredEvents = [
    {
      id: "1",
      title: "Technical Symposium 2025",
      date: "March 15, 2025",
      time: "9:00 AM",
      status: "upcoming",
      location: "Main Auditorium",
    },
    {
      id: "2",
      title: "Coding Hackathon",
      date: "March 22, 2025",
      time: "10:00 AM",
      status: "upcoming",
      location: "Computer Lab Block A",
    },
  ];

  const pastEvents = [
    {
      id: "3",
      title: "AI Workshop",
      date: "Feb 10, 2025",
      status: "completed",
      certificate: true,
    },
    {
      id: "4",
      title: "Cultural Night",
      date: "Jan 28, 2025",
      status: "completed",
      certificate: false,
    },
  ];

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
              <div className="text-2xl font-bold text-primary">2</div>
              <p className="text-xs text-muted-foreground">Events registered</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">2</div>
              <p className="text-xs text-muted-foreground">Events attended</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">1</div>
              <p className="text-xs text-muted-foreground">Available to download</p>
            </CardContent>
          </Card>
        </div>

        {/* Events Tabs */}
        <Tabs defaultValue="upcoming" className="animate-fade-in">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {registeredEvents.map((event) => (
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
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Registered
                    </Badge>
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
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {event.date}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                {event.certificate && (
                  <CardContent>
                    <Button variant="accent" size="sm">
                      Download Certificate
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
