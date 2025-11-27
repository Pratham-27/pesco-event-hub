import { Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileCompletionChecklistProps {
  profile: {
    name?: string;
    mobile?: string;
    email?: string;
    year?: string;
    semester?: string;
    course?: string;
  };
}

const ProfileCompletionChecklist = ({ profile }: ProfileCompletionChecklistProps) => {
  const checks = [
    { field: "name", label: "Full Name", value: profile.name },
    { field: "mobile", label: "Mobile Number", value: profile.mobile },
    { field: "email", label: "Email Address", value: profile.email },
    { field: "year", label: "Year of Study", value: profile.year },
    { field: "semester", label: "Semester", value: profile.semester },
    { field: "course", label: "Course", value: profile.course },
  ];

  const completedCount = checks.filter(check => check.value).length;
  const totalCount = checks.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Profile Completion</CardTitle>
        <CardDescription>
          {completedCount} of {totalCount} fields completed ({completionPercentage}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check.field} className="flex items-center gap-2">
              {check.value ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={check.value ? "text-foreground" : "text-muted-foreground"}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
        {completionPercentage === 100 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              🎉 Your profile is complete!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionChecklist;
