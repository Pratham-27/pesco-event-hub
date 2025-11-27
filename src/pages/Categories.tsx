import Navigation from "@/components/Navigation";
import CollegeHeader from "@/components/CollegeHeader";
import GoBackButton from "@/components/GoBackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Trophy, Briefcase, Palette, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: "technical",
    title: "Technical Events",
    description: "Symposiums, seminars, and technical competitions",
    icon: Code,
    count: 24,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "competitions",
    title: "Competitions",
    description: "Coding challenges, hackathons, and contests",
    icon: Trophy,
    count: 18,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "workshops",
    title: "Workshops",
    description: "Hands-on learning sessions and skill development",
    icon: BookOpen,
    count: 32,
    color: "from-green-500 to-green-600",
  },
  {
    id: "cultural",
    title: "Cultural Events",
    description: "Music, dance, drama, and art festivals",
    icon: Palette,
    count: 15,
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "industrial",
    title: "Industrial Visits",
    description: "Factory tours and industry exposure programs",
    icon: Briefcase,
    count: 8,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "guest-lectures",
    title: "Guest Lectures",
    description: "Expert talks and knowledge sharing sessions",
    icon: Users,
    count: 12,
    color: "from-cyan-500 to-cyan-600",
  },
];

const Categories = () => {
  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <GoBackButton />
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Event Categories
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore events organized by type and interest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link key={category.id} to="/events">
                <Card
                  className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{category.count} events</span>
                      <span className="text-primary font-medium group-hover:translate-x-1 transition-transform">
                        View all →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Categories;
