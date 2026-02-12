// 추천 상품 리스트 섹션
import ProductCard, { type ProductCardProps } from "@/components/recommend/parts/ProductCard";

type ProductInput = Omit<ProductCardProps, "tags">;

type ProductGridSectionProps = {
  products: ProductInput[];
  fallbackTags: string[];
  showAll: boolean;
  onShowAll: () => void;
};

const splitReasons = (reason: string): string[] => {
  const ignorePatterns = [/^score\s*=/i, /^rateMin\s*=/i, /^rateMax\s*=/i];
  return reason
    .split(/[,/]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && !ignorePatterns.some((pattern) => pattern.test(item)))
    .slice(0, 3);
};

const dedupeTags = (tags: string[]): string[] => {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const normalized = tag.trim();
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
};

const ProductGridSection = ({
  products,
  fallbackTags,
  showAll,
  onShowAll,
}: ProductGridSectionProps) => {
  const visibleProducts = showAll ? products : products.slice(0, 3);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => {
          const tags = dedupeTags(splitReasons(product.reason));
          const fallback = dedupeTags(fallbackTags);
          return (
            <ProductCard
              key={product.id}
              {...product}
              tags={tags.length > 0 ? tags : fallback}
            />
          );
        })}
      </div>
      {!showAll && products.length > 3 && (
        <button
          type="button"
          onClick={onShowAll}
          className="rounded-full border border-stone-300 bg-white px-6 py-2 text-sm font-semibold text-stone-700 hover:border-stone-400"
        >
          대출 상품 추천 더보기
        </button>
      )}
    </div>
  );
};

export default ProductGridSection;
