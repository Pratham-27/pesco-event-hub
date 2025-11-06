import { useState } from "react";
import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
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

const mockEvents = [
  {
    id: "1",
    title: "Technical Symposium 2025",
    description: "Annual technical event featuring competitions, workshops, and guest lectures from industry experts.",
    date: "March 15, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Main Auditorium, PESCOP",
    category: "Technical",
    attendees: 234,
    maxAttendees: 500,
    featured: true,
  },
  {
    id: "2",
    title: "Coding Hackathon",
    description: "24-hour coding marathon where teams compete to build innovative solutions to real-world problems.",
    date: "March 22, 2025",
    time: "10:00 AM - 10:00 AM (Next Day)",
    location: "Computer Lab Block A",
    category: "Competition",
    attendees: 156,
    maxAttendees: 200,
    featured: true,
  },
  {
    id: "3",
    title: "Industrial Visit - Manufacturing Unit",
    description: "Educational tour to a leading manufacturing facility to understand industrial processes.",
    date: "March 28, 2025",
    time: "8:00 AM - 4:00 PM",
    location: "Pune Industrial Area",
    category: "Industrial Visit",
    attendees: 45,
    maxAttendees: 60,
  },
  {
    id: "4",
    title: "Guest Lecture: AI & Machine Learning",
    description: "Expert talk on the future of AI and ML in engineering by renowned industry professional.",
    date: "April 5, 2025",
    time: "2:00 PM - 4:00 PM",
    location: "Seminar Hall 1",
    category: "Workshop",
    attendees: 189,
    maxAttendees: 250,
  },
  {
    id: "5",
    title: "Cultural Fest - Kaleidoscope",
    description: "Annual cultural celebration featuring music, dance, drama, and various art competitions.",
    date: "April 12-13, 2025",
    time: "9:00 AM - 8:00 PM",
    location: "College Campus",
    category: "Cultural",
    attendees: 567,
    maxAttendees: 1000,
    featured: true,
  },
  {
    id: "6",
    title: "Robotics Workshop",
    description: "Hands-on workshop on building and programming robots using Arduino and sensors.",
    date: "April 18, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Robotics Lab",
    category: "Workshop",
    attendees: 78,
    maxAttendees: 100,
  },
];

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Technical", "Competition", "Workshop", "Cultural", "Industrial Visit"];

  const filteredEvents = mockEvents.filter((event) => {
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

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted-foreground animate-fade-in">
          Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <EventCard {...event} />
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
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
      </main>
    </div>
  );
};

export default Events;
