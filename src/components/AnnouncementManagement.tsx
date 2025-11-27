import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Megaphone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Event {
  id: string;
  title: string;
}

interface AnnouncementFormData {
  id?: string;
  title: string;
  message: string;
  link: string;
  eventId: string;
  isImportant: boolean;
}

interface AnnouncementManagementProps {
  onAnnouncementChange: () => void;
  editData?: AnnouncementFormData | null;
  onEditComplete?: () => void;
}

const AnnouncementManagement = ({ 
  onAnnouncementChange, 
  editData,
  onEditComplete 
}: AnnouncementManagementProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    message: "",
    link: "",
    eventId: "",
    isImportant: false,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id,
        title: editData.title || "",
        message: editData.message || "",
        link: editData.link || "",
        eventId: editData.eventId || "",
        isImportant: editData.isImportant || false,
      });
      setOpen(true);
    }
  }, [editData]);

  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventsError(null);
    
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .in("status", ["upcoming", "live"])
        .order("date", { ascending: true });

      if (error) throw error;
      
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      setEventsError(error.message || "Failed to load events");
      toast({
        title: "Error",
        description: "Failed to load events. You can still create announcements without linking to an event.",
        variant: "destructive",
      });
    } finally {
      setLoadingEvents(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      link: "",
      eventId: "",
      isImportant: false,
    });
    if (onEditComplete) {
      onEditComplete();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const announcementData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        link: formData.link.trim() || null,
        event_id: formData.eventId || null,
        is_important: formData.isImportant,
        created_by: user.id,
      };

      if (formData.id) {
        // Update existing announcement
        const { error } = await supabase
          .from("announcements")
          .update(announcementData)
          .eq("id", formData.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        // Create new announcement
        const { error } = await supabase
          .from("announcements")
          .insert([announcementData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
      }

      onAnnouncementChange();
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Announcement error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>
                {formData.id ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
              <DialogDescription>
                Share important updates with all students
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loadingEvents ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading form...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Write your announcement message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (Optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://example.com"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Related Event (Optional)</Label>
              <Select
                value={formData.eventId}
                onValueChange={(value) => setFormData({ ...formData, eventId: value })}
                disabled={eventsError !== null}
              >
                <SelectTrigger id="event">
                  <SelectValue placeholder={eventsError ? "Events unavailable" : "Select an event"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {eventsError && (
                <p className="text-xs text-muted-foreground">
                  Events couldn't be loaded, but you can still create announcements
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="space-y-0.5">
                <Label htmlFor="important" className="cursor-pointer">
                  Mark as Important
                </Label>
                <p className="text-xs text-muted-foreground">
                  Important announcements are highlighted and pinned
                </p>
              </div>
              <Switch
                id="important"
                checked={formData.isImportant}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isImportant: checked })
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `${formData.id ? "Update" : "Create"} Announcement`
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementManagement;
