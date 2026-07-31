import ChangePasswordForm from "@/components/ChangePasswordForm";

export default function TailorSettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Settings</h1>
      <div className="rounded-lg border border-border p-6">
        <h2 className="mb-4 font-serif text-lg text-foreground">Change Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
