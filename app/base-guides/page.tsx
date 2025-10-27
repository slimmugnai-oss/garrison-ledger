import { redirect } from "next/navigation";

/**
 * Base Guides - Redirects to Base Navigator
 *
 * The base guides functionality has been integrated into the Base Navigator,
 * which provides comprehensive information about all 203 military bases worldwide.
 */
export default function BaseGuidesPage() {
  redirect("/dashboard/navigator");
}
