import { redirect } from "next/navigation";

/** Legacy advisor route — canonical executive landing is `/brief`. */
export default function AdvisorRedirectPage() {
  redirect("/brief");
}
