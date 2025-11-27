import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Megaphone, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface AnnouncementCardProps {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  eventId?: string | null;
  eventTitle?: string | null;
  isImportant: boolean;
  createdAt: string;
  createdBy: string;
  authorName?: string;
  isAdmin?: boolean;
  onEdit?: (announcement: any) => void;
  onDelete?: (id: string) => void;
}

const AnnouncementCard = ({
  id,
  title,
  message,
  link,
  eventId,
  eventTitle,
  isImportant,
  createdAt,
  createdBy,
  authorName,
  isAdmin = false,
  onEdit,
  onDelete,
}: AnnouncementCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  return (
    <Card 
      className={`group hover:shadow-md transition-all duration-300 ${
        isImportant 
          ? 'border-primary/50 bg-primary/5 hover:border-primary' 
          : 'hover:border-border'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isImportant 
                ? 'bg-gradient-to-br from-primary to-accent' 
                : 'bg-secondary'
            }`}>
              <Megaphone className={`w-5 h-5 ${isImportant ? 'text-white' : 'text-primary'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <CardTitle className="text-lg">{title}</CardTitle>
                {isImportant && (
                  <Badge className="bg-primary text-primary-foreground">
                    Important
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <span className="text-xs">Official</span>
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-xs">
                <Calendar className="w-3 h-3" />
                {formatDate(createdAt)}
                {authorName && (
                  <>
                    <span>•</span>
                    <span>by {authorName}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>

          {isAdmin && onEdit && onDelete && (
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit({ id, title, message, link, eventId, isImportant })}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message}</p>

        {eventTitle && eventId && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Related Event: {eventTitle}</span>
          </div>
        )}

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View More
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
