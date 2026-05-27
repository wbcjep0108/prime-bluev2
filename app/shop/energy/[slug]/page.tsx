import { notFound } from "next/navigation";
import EnergyProductDetail from "../../../../components/EnergyProductDetail";
import { energyProducts } from "../../../../data/energyProducts";

export function generateStaticParams() {
  return energyProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = energyProducts.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found | Prime Energy" };
  return {
    title: `${product.name} | Prime Energy`,
    description: product.tagline,
  };
}

export default async function EnergyProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = energyProducts.find((p) => p.slug === slug);

  if (!product) notFound();
  return <EnergyProductDetail product={product} />;
}
