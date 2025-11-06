import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CollegeHeader from "@/components/CollegeHeader";
import Navigation from "@/components/Navigation";
import { ArrowRight, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  year: z.enum(["FY", "SY", "TY", "BTech"], { errorMap: () => ({ message: "Please select a valid year" }) }),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
});

const adminSignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const adminSignUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  
  const [signUpData, setSignUpData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    year: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
    mobile: "",
  });

  const [adminSignInData, setAdminSignInData] = useState({
    email: "",
    password: "",
  });

  const [adminSignUpData, setAdminSignUpData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const validationResult = signUpSchema.safeParse(signUpData);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(signUpData.email, signUpData.password, {
      name: signUpData.name,
      mobile: signUpData.mobile,
      year: signUpData.year,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Account created successfully. You're now logged in!",
    });
    
    navigate("/community");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const validationResult = signInSchema.safeParse(signInData);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(signInData.email, signInData.password);
    setLoading(false);

    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Login successful. Welcome back!",
    });
    
    navigate("/community");
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const validationResult = adminSignInSchema.safeParse(adminSignInData);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(adminSignInData.email, adminSignInData.password);
    setLoading(false);

    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Admin Login Successful",
      description: "Welcome back, Admin!",
    });
    
    navigate("/admin");
  };

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const validationResult = adminSignUpSchema.safeParse(adminSignUpData);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(adminSignUpData.email, adminSignUpData.password, {
      name: adminSignUpData.name,
      mobile: "",
      year: "",
      is_admin: true,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Admin Account Created",
      description: "Admin account created successfully. You're now logged in!",
    });
    
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Authentication</CardTitle>
              <CardDescription>
                Sign in or create an account
              </CardDescription>
              <div className="flex gap-2 justify-center pt-2">
                <Button
                  variant={loginType === "student" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLoginType("student")}
                >
                  Student
                </Button>
                <Button
                  variant={loginType === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLoginType("admin")}
                >
                  Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loginType === "student" ? (
                <Tabs defaultValue="signin">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email Address</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your college email"
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-mobile">Mobile Number</Label>
                        <Input
                          id="signin-mobile"
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={signInData.mobile}
                          onChange={(e) => setSignInData({ ...signInData, mobile: e.target.value })}
                          pattern="[0-9]{10}"
                          maxLength={10}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full group" size="lg" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </form>
                  </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={signUpData.mobile}
                        onChange={(e) => setSignUpData({ ...signUpData, mobile: e.target.value })}
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your college email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Min 8 chars, with uppercase, lowercase & number"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be 8+ characters with uppercase, lowercase, and number
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year of Study</Label>
                      <Select value={signUpData.year} onValueChange={(value) => setSignUpData({ ...signUpData, year: value })}>
                        <SelectTrigger id="year">
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FY">First Year (FY)</SelectItem>
                          <SelectItem value="SY">Second Year (SY)</SelectItem>
                          <SelectItem value="TY">Third Year (TY)</SelectItem>
                          <SelectItem value="BTech">B.Tech (Final Year)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full group" size="lg" disabled={loading}>
                      {loading ? "Creating account..." : "Sign Up"}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              ) : (
                <Tabs defaultValue="signin" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleAdminSignIn} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-signin-email">Admin Email</Label>
                        <Input
                          id="admin-signin-email"
                          type="email"
                          placeholder="Enter admin email"
                          value={adminSignInData.email}
                          onChange={(e) => setAdminSignInData({ ...adminSignInData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-signin-password">Admin Password</Label>
                        <Input
                          id="admin-signin-password"
                          type="password"
                          placeholder="Enter admin password"
                          value={adminSignInData.password}
                          onChange={(e) => setAdminSignInData({ ...adminSignInData, password: e.target.value })}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full group" size="lg" disabled={loading}>
                        {loading ? "Signing in..." : "Admin Sign In"}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleAdminSignUp} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-name">Full Name</Label>
                        <Input
                          id="admin-name"
                          placeholder="Enter admin full name"
                          value={adminSignUpData.name}
                          onChange={(e) => setAdminSignUpData({ ...adminSignUpData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-signup-email">Admin Email</Label>
                        <Input
                          id="admin-signup-email"
                          type="email"
                          placeholder="Enter admin email"
                          value={adminSignUpData.email}
                          onChange={(e) => setAdminSignUpData({ ...adminSignUpData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-signup-password">Password</Label>
                        <Input
                          id="admin-signup-password"
                          type="password"
                          placeholder="Min 8 chars, with uppercase, lowercase & number"
                          value={adminSignUpData.password}
                          onChange={(e) => setAdminSignUpData({ ...adminSignUpData, password: e.target.value })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be 8+ characters with uppercase, lowercase, and number
                        </p>
                      </div>

                      <Button type="submit" className="w-full group" size="lg" disabled={loading}>
                        {loading ? "Creating admin account..." : "Admin Sign Up"}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
