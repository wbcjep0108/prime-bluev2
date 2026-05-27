import { notFound } from "next/navigation";
import ShakeProductDetail from "../../../../components/ShakeProductDetail";
import { shakeProducts } from "../../../../data/shakeProducts";

export function generateStaticParams() {
  return shakeProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = shakeProducts.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found | Prime Shake" };
  return {
    title: `${product.name} | Prime Shake`,
    description: product.tagline,
  };
}

export default async function ShakeProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = shakeProducts.find((p) => p.slug === slug);

  if (!product) notFound();
  return <ShakeProductDetail product={product} />;
}
