import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, MessageSquare, TrendingUp } from "lucide-react";

interface AnalyticsData {
  upcomingEvents: number;
  totalRegistrations: number;
  pendingSuggestions: number;
  totalUsers: number;
}

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    upcomingEvents: 0,
    totalRegistrations: 0,
    pendingSuggestions: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Count upcoming events
    const { count: eventsCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "upcoming");

    // Count total registrations
    const { count: registrationsCount } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true });

    // Count pending suggestions
    const { count: suggestionsCount } = await supabase
      .from("community_discussions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Count total users
    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    setAnalytics({
      upcomingEvents: eventsCount || 0,
      totalRegistrations: registrationsCount || 0,
      pendingSuggestions: suggestionsCount || 0,
      totalUsers: usersCount || 0,
    });
  };

  const stats = [
    {
      title: "Upcoming Events",
      value: analytics.upcomingEvents,
      icon: Calendar,
      description: "Active events",
      color: "text-blue-500",
    },
    {
      title: "Total Registrations",
      value: analytics.totalRegistrations,
      icon: Users,
      description: "All event registrations",
      color: "text-green-500",
    },
    {
      title: "Pending Suggestions",
      value: analytics.pendingSuggestions,
      icon: MessageSquare,
      description: "Awaiting review",
      color: "text-orange-500",
    },
    {
      title: "Total Users",
      value: analytics.totalUsers,
      icon: TrendingUp,
      description: "Registered users",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
