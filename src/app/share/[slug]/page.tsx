import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/actions/properties";
import { PublicHeader } from "@/components/layout/header";
import { ShareView } from "@/components/share/ShareView";

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  return (
    <>
      <PublicHeader companyName={property.profile?.company_name} />
      <ShareView property={property} />
    </>
  );
}
