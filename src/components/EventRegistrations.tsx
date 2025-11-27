import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Download, Loader2 } from "lucide-react";

interface Registration {
  id: string;
  user_id: string;
  registered_at: string;
  attended: boolean;
  user?: {
    name: string;
    email: string;
    mobile: string;
    year: string;
    semester: string;
    course: string;
  };
}

interface EventRegistrationsProps {
  eventId: string;
  eventTitle: string;
}

export const EventRegistrations = ({ eventId, eventTitle }: EventRegistrationsProps) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchRegistrations();
    }
  }, [open, eventId]);

  const fetchRegistrations = async () => {
    setLoading(true);
    
    // Fetch registrations
    const { data: regsData, error: regsError } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });

    if (regsError) {
      toast({
        title: "Error",
        description: "Failed to fetch registrations.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch user profiles
    const userIds = regsData?.map(r => r.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email, mobile, year, semester, course")
      .in("id", userIds);

    // Combine data
    const combined = regsData?.map(reg => ({
      ...reg,
      user: profiles?.find(p => p.id === reg.user_id)
    })) || [];

    setRegistrations(combined);
    setLoading(false);
  };

  const toggleAttendance = async (registrationId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("event_registrations")
      .update({ attended: !currentStatus })
      .eq("id", registrationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance.",
        variant: "destructive",
      });
    } else {
      fetchRegistrations();
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Mobile", "Course", "Year", "Semester", "Registered At", "Attended"];
    const rows = registrations.map(reg => [
      reg.user?.name || "",
      reg.user?.email || "",
      reg.user?.mobile || "",
      reg.user?.course || "",
      reg.user?.year || "",
      reg.user?.semester || "",
      new Date(reg.registered_at).toLocaleString(),
      reg.attended ? "Yes" : "No"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Registrations exported successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          View Registrations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Registrations: {eventTitle}</DialogTitle>
          <DialogDescription>
            View and manage student registrations for this event
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Total Registrations: <Badge variant="secondary">{registrations.length}</Badge>
              </div>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            {registrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No registrations yet
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-center">Attended</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.user?.name || "-"}</TableCell>
                        <TableCell>{reg.user?.email || "-"}</TableCell>
                        <TableCell>{reg.user?.mobile || "-"}</TableCell>
                        <TableCell>{reg.user?.course || "-"}</TableCell>
                        <TableCell>{reg.user?.year || "-"}</TableCell>
                        <TableCell>{reg.user?.semester || "-"}</TableCell>
                        <TableCell>{new Date(reg.registered_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={reg.attended}
                            onCheckedChange={() => toggleAttendance(reg.id, reg.attended)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
