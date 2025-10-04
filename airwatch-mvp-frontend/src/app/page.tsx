import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
  // This return is never reached due to the redirect
  return null;
}
