import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
import EventCard from "@/components/EventCard";
import { Calendar, TrendingUp, Users, Award, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const featuredEvents = [
  {
    id: "1",
    title: "Innovation 2k26",
    description: "Annual technical event featuring competitions, workshops, and guest lectures from industry experts.",
    date: "March 15, 2026",
    time: "9:00 AM - 5:00 PM",
    location: "Main Auditorium, PESCOP",
    category: "Technical",
    current_attendees: 234,
    max_attendees: 500,
    featured: true,
  },
  {
    id: "2",
    title: "Kurukshetra 2k26",
    description: "Premier technical symposium with cutting-edge competitions and innovation challenges.",
    date: "March 22, 2026",
    time: "9:00 AM - 6:00 PM",
    location: "Main Campus, PESCOP",
    category: "Technical",
    current_attendees: 156,
    max_attendees: 500,
    featured: true,
  },
  {
    id: "3",
    title: "Nexus AI Build",
    description: "Live AI hackathon where teams build innovative AI-powered solutions. Currently ongoing!",
    date: "November 6-7, 2025",
    time: "10:00 AM - 10:00 AM (Next Day)",
    location: "Computer Lab Block A",
    category: "Competition",
    current_attendees: 89,
    max_attendees: 150,
    featured: true,
  },
];

const stats = [
  { icon: Calendar, label: "Total Events", value: "150+", color: "from-primary to-primary/70" },
  { icon: Users, label: "Participants", value: "5,000+", color: "from-accent to-accent/70" },
  { icon: TrendingUp, label: "Success Rate", value: "98%", color: "from-primary to-accent" },
  { icon: Award, label: "Awards Won", value: "50+", color: "from-accent to-primary" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Welcome to Event Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Discover, Register & Participate in{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Campus Events
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your one-stop platform for all technical symposiums, workshops, cultural fests, and competitions at PESCOP
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/events">
                <Button size="lg" variant="default" className="group">
                  Browse Events
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center space-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10 animate-fade-in">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Events</h2>
              <p className="text-muted-foreground">Don't miss out on these upcoming highlights</p>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="hidden md:inline-flex group">
                View All
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredEvents.map((event, index) => (
              <div
                key={event.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <EventCard {...event} disableRegistration />
              </div>
            ))}
          </div>

          <div className="text-center md:hidden animate-fade-in">
            <Link to="/events">
              <Button variant="outline" className="group">
                View All Events
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-accent/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg md:text-xl text-white/90">
              Join thousands of students participating in exciting events across campus
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/events">
                <Button size="lg" variant="accent" className="bg-white hover:bg-white/90 text-primary">
                  Register for Events
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Phaltan Education Society's College of Engineering, Phaltan. All rights reserved.</p>
            <p className="mt-2">Affiliated to Dr. Babasaheb Ambedkar Technological University, Lonere</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
