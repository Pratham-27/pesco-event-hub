import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { User, LogOut, Calendar, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const UserProfileMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: registrations } = useQuery({
    queryKey: ["user-registrations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("event_registrations")
        .select("*, events(*)")
        .eq("user_id", user.id)
        .order("registered_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!user) return null;

  const currentEvents = registrations?.filter(
    (reg: any) => reg.events?.status === "upcoming"
  ) || [];
  
  const pastEvents = registrations?.filter(
    (reg: any) => reg.events?.status === "completed"
  ) || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 hover:bg-secondary/50">
          <User className="w-4 h-4" />
          <span className="hidden md:inline">{profile?.name || "User"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{profile?.name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>

          <Separator />

          {/* Current Registrations */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Registered Events ({currentEvents.length})</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {currentEvents.length > 0 ? (
                currentEvents.map((reg: any) => (
                  <div
                    key={reg.id}
                    className="text-sm p-2 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <p className="font-medium truncate">{reg.events?.title}</p>
                    <p className="text-xs text-muted-foreground">{reg.events?.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming registrations</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Past Events */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Past Events ({pastEvents.length})</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {pastEvents.length > 0 ? (
                pastEvents.map((reg: any) => (
                  <div
                    key={reg.id}
                    className="text-sm p-2 rounded-md bg-muted/30"
                  >
                    <p className="font-medium truncate">{reg.events?.title}</p>
                    <p className="text-xs text-muted-foreground">{reg.events?.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No past events</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfileMenu;
