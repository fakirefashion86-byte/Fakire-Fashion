import { redirect } from "next/navigation";

export default function TailorSignupPage() {
  redirect("/register?role=tailor");
}
