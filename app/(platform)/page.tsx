import { redirect } from "next/navigation";

/** Executive platform home redirects to Morning Brief. */
export default function PlatformHomePage() {
  redirect("/brief");
}
