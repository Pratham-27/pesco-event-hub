import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  current_attendees: number;
  max_attendees: number;
  status?: string;
  image?: string;
  featured?: boolean;
  onRegistrationChange?: () => void;
  disableRegistration?: boolean;
}

const EventCard = ({
  id,
  title,
  description,
  date,
  time,
  location,
  category,
  current_attendees,
  max_attendees,
  status,
  image,
  featured = false,
  onRegistrationChange,
  disableRegistration = false,
}: EventCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkRegistration();
    }
  }, [user, id]);

  const checkRegistration = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", id)
      .maybeSingle();

    setIsRegistered(!!data);
  };

  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to register for events",
      });
      navigate("/auth");
      return;
    }

    if (current_attendees >= max_attendees) {
      toast({
        title: "Event Full",
        description: "This event has reached maximum capacity",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("event_registrations")
      .insert([{ user_id: user.id, event_id: id }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Update attendee count
    await supabase.rpc("increment_event_attendees" as any, { event_id: id });

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .single();

    // Send registration email
    if (profile) {
      supabase.functions.invoke("send-registration-email", {
        body: {
          userEmail: profile.email,
          userName: profile.name,
          eventTitle: title,
          eventDate: date,
          eventTime: time,
          eventLocation: location,
        },
      }).catch((err) => console.error("Email error:", err));
    }

    toast({
      title: "Success",
      description: "Successfully registered! Check your email for confirmation.",
    });
    setIsRegistered(true);
    onRegistrationChange?.();
    setLoading(false);
  };

  const handleUnregister = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel registration",
        variant: "destructive",
      });
    } else {
      // Update attendee count
      await supabase.rpc("decrement_event_attendees" as any, { event_id: id });
      
      toast({
        title: "Success",
        description: "Registration cancelled",
      });
      setIsRegistered(false);
      onRegistrationChange?.();
    }

    setLoading(false);
  };

  const isFull = current_attendees >= max_attendees;
  const isCompleted = status === "completed" || status === "cancelled";
  
  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
            <Calendar className="w-16 h-16 text-white/50" />
          </div>
        )}
        {featured && (
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground font-semibold">
            Featured
          </Badge>
        )}
        <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground backdrop-blur-sm">
          {category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{description}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>
              {current_attendees}/{max_attendees} Registered
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {disableRegistration || isCompleted ? (
            <div className="flex-1">
              {isCompleted ? (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  {status === "cancelled" ? "Event Cancelled" : "Event Completed"}
                </Button>
              ) : (
                <Link to="/events" className="flex-1">
                  <Button variant="default" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              )}
            </div>
          ) : isRegistered ? (
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1" 
              onClick={handleUnregister}
              disabled={loading}
            >
              {loading ? "Processing..." : "Cancel Registration"}
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1" 
              onClick={handleRegister}
              disabled={loading || isFull}
            >
              {loading ? "Processing..." : isFull ? "Event Full" : "Register"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
