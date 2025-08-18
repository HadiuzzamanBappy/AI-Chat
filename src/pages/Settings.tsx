import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Bell, Shield, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Settings() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);

  const handleSaveProfile = () => {
    // Mock save profile
    console.log("Profile saved:", { name, email });
  };

  const handleSavePreferences = () => {
    // Mock save preferences
    console.log("Preferences saved:", { notifications, emailUpdates, dataCollection });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-2 mb-8">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Settings */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>Profile</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-input-border focus:border-input-border-focus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-input-border focus:border-input-border-focus"
                    />
                  </div>
                  <Button 
                    onClick={handleSaveProfile}
                    className="bg-primary hover:bg-primary-hover"
                  >
                    Save Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>
                    Configure your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages
                      </p>
                    </div>
                    <Switch
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive product updates via email
                      </p>
                    </div>
                    <Switch
                      checked={emailUpdates}
                      onCheckedChange={setEmailUpdates}
                    />
                  </div>
                  <Button 
                    onClick={handleSavePreferences}
                    className="bg-primary hover:bg-primary-hover"
                  >
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Privacy & Security</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow data collection to improve our services
                      </p>
                    </div>
                    <Switch
                      checked={dataCollection}
                      onCheckedChange={setDataCollection}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button variant="secondary" className="w-full">
                      Download Your Data
                    </Button>
                    <Button variant="secondary" className="w-full">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <CardTitle>Appearance</CardTitle>
                  </div>
                  <CardDescription>
                    Customize the app appearance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label>Dark Mode</Label>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Version 1.0.0
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Built with React, TypeScript, and Tailwind CSS
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}