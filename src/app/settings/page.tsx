
'use client'

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-8">
       <PageHeader
        title="Settings"
        description="Manage your account settings and preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
          </div>
           <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" placeholder="Enter your display name" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Password</CardTitle>
          <CardDescription>
            Change your password here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Update Password</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="theme">Theme</Label>
             <Select defaultValue="system">
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Branding &amp; Localization</CardTitle>
          <CardDescription>Manage your application's branding and currency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" defaultValue="GLOW" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-light">Sidebar Logo URL (Light Mode)</Label>
            <Input id="logo-light" defaultValue="https://iili.io/KYqQC1R.png" />
             <p className="text-sm text-muted-foreground">Your logo will be displayed in the sidebar. Recommended size: 32x32 pixels.</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="logo-dark">Sidebar Logo URL (Dark Mode)</Label>
            <Input id="logo-dark" defaultValue="https://iili.io/KYkW0NV.png" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="auth-logo-light">Auth Page Logo URL (Light Mode)</Label>
            <Input id="auth-logo-light" defaultValue="https://iili.io/KYqQC1R.png" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="auth-logo-dark">Auth Page Logo URL (Dark Mode)</Label>
            <Input id="auth-logo-dark" defaultValue="https://iili.io/KYkW0NV.png" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="favicon">Favicon URL</Label>
            <Input id="favicon" defaultValue="https://iili.io/KYqQC1R.png" />
            <p className="text-sm text-muted-foreground">The icon that appears in the browser tab.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select defaultValue="pkr">
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pkr">Pakistani Rupee (₨)</SelectItem>
                <SelectItem value="usd">United States Dollar ($)</SelectItem>
                <SelectItem value="eur">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Choose the currency to be used across the application.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save Branding</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Security</CardTitle>
            <CardDescription>Manage application access and security settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="signup-visibility" className="font-medium">Sign Up Page Visibility</Label>
                    <p className="text-sm text-muted-foreground">Control whether new users can create an account.</p>
                </div>
                <Switch id="signup-visibility" defaultChecked />
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button>Save Security Settings</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Data Management</CardTitle>
            <CardDescription>Permanently delete application data. This is useful for clearing test data.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="destructive">Reset Application Data</Button>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="low-stock-alerts" className="font-medium">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive an email when stock is low.</p>
                </div>
                <Switch id="low-stock-alerts" />
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="weekly-summary" className="font-medium">Weekly Summary</Label>
                    <p className="text-sm text-muted-foreground">Get a weekly summary of sales and expenses.</p>
                </div>
                <Switch id="weekly-summary" defaultChecked />
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
