import { notFound } from "next/navigation";
import { getProperty } from "@/lib/actions/properties";
import { AppHeader } from "@/components/layout/header";
import { PropertyWizard } from "@/components/wizard/PropertyWizard";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) notFound();

  return (
    <>
      <AppHeader />
      <PropertyWizard property={property} />
    </>
  );
}
