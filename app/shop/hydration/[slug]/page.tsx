import { notFound } from 'next/navigation';
import HydrationProductDetail from '../../../../components/HydrationProductDetail';
import { hydrationProducts, hydrationBySlug } from '../../../../data/hydrationProducts';

export function generateStaticParams() {
  return hydrationProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = hydrationBySlug[slug];
  if (!product) return { title: 'Product Not Found | Prime Hydration' };
  return {
    title: `${product.name} | Prime Hydration`,
    description: product.description,
  };
}

export default async function HydrationProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = hydrationBySlug[slug];

  if (!product) notFound();

  return <HydrationProductDetail product={product} />;
}
