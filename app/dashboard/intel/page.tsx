/**
 * INTEL LIBRARY - Redirect to Ask Assistant
 *
 * This page has been transformed into the Ask Assistant
 */

import { redirect } from "next/navigation";

export default function IntelLibraryRedirect() {
  redirect("/dashboard/ask");
}
