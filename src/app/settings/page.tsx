import { AppHeader } from "@/components/layout/header";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="mt-6">
            <ChangePasswordForm />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
