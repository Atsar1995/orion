import { redirect } from "next/navigation";

/** Legacy route — redirects to Mission 16A.1 activities path. */
export default function CrmActivityRedirectPage() {
  redirect("/crm/activities");
}
