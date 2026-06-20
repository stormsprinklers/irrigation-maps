import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/actions/properties";
import { StormSprinklersHeader, StormSprinklersFooter } from "@/components/layout/storm-sprinklers-branding";
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
    <div className="flex min-h-screen flex-col">
      <StormSprinklersHeader />
      <ShareView property={property} />
      <StormSprinklersFooter />
    </div>
  );
}
