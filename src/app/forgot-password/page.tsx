import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot Password" subtitle="Reset your password by email">
      <p className="text-center text-sm text-ink-secondary">
        Email-based password reset is coming soon. In the meantime, please contact support to
        reset your password.
      </p>
      <p className="mt-6 text-center text-sm text-ink-secondary">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
