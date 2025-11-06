import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  image?: string;
  featured?: boolean;
}

const EventCard = ({
  title,
  description,
  date,
  time,
  location,
  category,
  attendees,
  maxAttendees,
  image,
  featured = false,
}: EventCardProps) => {
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
              {attendees}/{maxAttendees} Registered
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="default" size="sm" className="flex-1">
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
