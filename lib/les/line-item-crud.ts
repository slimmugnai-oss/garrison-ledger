/**
 * LINE ITEM CRUD HELPERS
 *
 * Client-side helpers for add/update/delete/fetch operations on LES line items
 */

import type { DynamicLineItem } from "@/app/types/les";

/**
 * Add multiple line items to an upload
 */
export async function addLineItems(
  uploadId: string,
  lines: Omit<DynamicLineItem, "id">[]
): Promise<DynamicLineItem[]> {
  const response = await fetch(`/api/les/upload/${uploadId}/add-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add line items");
  }

  return response.json();
}

/**
 * Update a single line item
 */
export async function updateLineItem(
  uploadId: string,
  lineId: string,
  updates: Partial<Pick<DynamicLineItem, "line_code" | "description" | "amount_cents" | "section">>
): Promise<DynamicLineItem> {
  const response = await fetch(`/api/les/upload/${uploadId}/lines/${lineId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update line item");
  }

  const { data } = await response.json();
  return data;
}

/**
 * Delete a single line item
 */
export async function deleteLineItem(uploadId: string, lineId: string): Promise<void> {
  const response = await fetch(`/api/les/upload/${uploadId}/lines/${lineId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete line item");
  }
}

/**
 * Fetch all line items for an upload
 */
export async function fetchLineItems(uploadId: string): Promise<DynamicLineItem[]> {
  const response = await fetch(`/api/les/upload/${uploadId}/lines`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch line items");
  }

  const { data } = await response.json();
  return data.map((line: any) => ({
    id: line.id,
    line_code: line.line_code,
    description: line.description,
    amount_cents: line.amount_cents,
    section: line.section,
    isCustom: false,
    isParsed: true,
    dbId: line.id,
  }));
}
