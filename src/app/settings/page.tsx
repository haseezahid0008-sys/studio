
'use client'

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAppSettings, updateAppSettings } from "@/lib/firestore";
import type { AppSettings } from "@/lib/types";
import { useTheme } from "next-themes";
import { updateProfile } from "firebase/auth";

export default function SettingsPage() {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);


  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const appSettings = await getAppSettings();
      setSettings(appSettings);
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);


  const handleSettingsChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({...prev, [key]: value}));
  }

  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    try {
      await updateAppSettings(settings);
      toast({
        title: "Success",
        description: `Branding settings saved successfully.`,
      })
      // force reload to apply favicon and other meta changes
      window.location.reload();
    } catch (error) {
      console.error(`Failed to save Branding settings`, error);
      toast({
        title: "Error",
        description: `Failed to save Branding settings. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setIsSavingBranding(false);
    }
  }

   const handleSaveSecurity = async () => {
    setIsSavingSecurity(true);
    try {
      await updateAppSettings({signupVisible: settings.signupVisible});
      toast({
        title: "Success",
        description: `Security settings saved successfully.`,
      })
    } catch (error) {
      console.error(`Failed to save Security settings`, error);
      toast({
        title: "Error",
        description: `Failed to save Security settings. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setIsSavingSecurity(false);
    }
  }

  const handleProfileSave = async () => {
    if (!user) return;
    setIsProfileSaving(true);
    try {
      await updateProfile(user, { displayName });
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
       console.error("Failed to update profile", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProfileSaving(false);
    }
  }

  const handlePasswordUpdate = async () => {
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
        setPasswordError("Password should be at least 6 characters.");
        return;
    }

    setIsPasswordSaving(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast({
        title: "Success",
        description: "Password updated successfully."
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Failed to update password", error);
      setPasswordError(error.message || "Failed to update password. Please check your current password and try again.");
    } finally {
      setIsPasswordSaving(false);
    }
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
            <Input id="name" placeholder="Enter your display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isProfileSaving}/>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleProfileSave} disabled={isProfileSaving}>
             {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
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
            <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} disabled={isPasswordSaving}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={isPasswordSaving}/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isPasswordSaving}/>
          </div>
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handlePasswordUpdate} disabled={isPasswordSaving}>
            {isPasswordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
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
             <Select value={theme} onValueChange={setTheme}>
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
            <Label htmlFor="appName">Application Name</Label>
            <Input id="appName" value={settings.appName || ''} onChange={e => handleSettingsChange('appName', e.target.value)} disabled={isSavingBranding}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoLight">Sidebar Logo URL (Light Mode)</Label>
            <Input id="logoLight" value={settings.logoLight || ''} onChange={e => handleSettingsChange('logoLight', e.target.value)} disabled={isSavingBranding}/>
             <p className="text-sm text-muted-foreground">Your logo will be displayed in the sidebar. Recommended size: 32x32 pixels.</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="logoDark">Sidebar Logo URL (Dark Mode)</Label>
            <Input id="logoDark" value={settings.logoDark || ''} onChange={e => handleSettingsChange('logoDark', e.target.value)} disabled={isSavingBranding}/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="authLogoLight">Auth Page Logo URL (Light Mode)</Label>
            <Input id="authLogoLight" value={settings.authLogoLight || ''} onChange={e => handleSettingsChange('authLogoLight', e.target.value)} disabled={isSavingBranding}/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="authLogoDark">Auth Page Logo URL (Dark Mode)</Label>
            <Input id="authLogoDark" value={settings.authLogoDark || ''} onChange={e => handleSettingsChange('authLogoDark', e.target.value)} disabled={isSavingBranding}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="favicon">Favicon URL</Label>
            <Input id="favicon" value={settings.favicon || ''} onChange={e => handleSettingsChange('favicon', e.target.value)} disabled={isSavingBranding}/>
            <p className="text-sm text-muted-foreground">The icon that appears in the browser tab.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={settings.currency || 'pkr'} onValueChange={value => handleSettingsChange('currency', value)} disabled={isSavingBranding}>
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
          <Button onClick={handleSaveBranding} disabled={isSavingBranding}>
            {isSavingBranding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Branding
          </Button>
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
                <Switch 
                  id="signup-visibility" 
                  checked={settings.signupVisible} 
                  onCheckedChange={value => handleSettingsChange('signupVisible', value)} 
                  disabled={isSavingSecurity}
                />
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveSecurity} disabled={isSavingSecurity}>
              {isSavingSecurity && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Security Settings
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Data Management</CardTitle>
            <CardDescription>Permanently delete application data. This is useful for clearing test data.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" disabled>Reset Application Data</Button>
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
                <Switch id="low-stock-alerts" disabled/>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="weekly-summary" className="font-medium">Weekly Summary</Label>
                    <p className="text-sm text-muted-foreground">Get a weekly summary of sales and expenses.</p>
                </div>
                <Switch id="weekly-summary" defaultChecked disabled/>
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button disabled>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
