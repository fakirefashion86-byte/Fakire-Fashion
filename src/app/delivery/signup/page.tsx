import { redirect } from "next/navigation";

export default function DeliverySignupPage() {
  redirect("/register?role=delivery");
}
