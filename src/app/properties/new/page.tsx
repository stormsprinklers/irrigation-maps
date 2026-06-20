import { redirect } from "next/navigation";
import { createProperty } from "@/lib/actions/properties";

export default async function NewPropertyPage() {
  const property = await createProperty();
  redirect(`/properties/${property.id}/edit`);
}
