// 추천 상품 카드
export type ProductCardProps = {
  id: string;
  lenderName: string;
  productName: string;
  rate: string;
  limit: string;
  reason: string;
  suitabilityScore: number;
  tags: string[];
  estimationDetails?: {
    factorCode: string;
    factorName: string;
    factorValue: string;
    contribution?: string | null;
  }[];
};

const ProductCard = ({
  id,
  lenderName,
  productName,
  rate,
  limit,
  reason,
  suitabilityScore,
  tags,
  estimationDetails = [],
}: ProductCardProps) => (
  <article className="rounded-3xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
    <div className="flex items-start justify-between gap-6">
      <div>
        <div className="text-xs text-stone-500">{lenderName}</div>
        <h2 className="text-lg font-semibold text-stone-900">{productName}</h2>
        <div className="mt-2 text-sm text-stone-600">{rate}</div>
        <div className="text-sm text-stone-600">{limit}</div>
      </div>
      <button
        type="button"
        className="h-10 rounded-full border border-stone-400 px-4 text-sm font-semibold text-stone-700"
      >
        상세 보기
      </button>
    </div>
    <div className="mt-4 grid gap-2 text-sm text-stone-600">
      <div>
        <span className="font-semibold text-stone-800">추천 사유:</span> {reason}
      </div>
      <div>
        <span className="font-semibold text-stone-800">적합도:</span> {suitabilityScore}점
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={`${id}-${tag}`}
          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-900"
        >
          {tag}
        </span>
      ))}
    </div>
    {estimationDetails.length > 0 && (
      <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-xs text-stone-600">
        <div className="mb-2 text-xs font-semibold text-stone-700">추정 상세</div>
        <div className="grid gap-1">
          {estimationDetails.map((detail) => (
            <div key={`${id}-${detail.factorCode}-${detail.factorValue}`} className="flex justify-between gap-3">
              <span>{detail.factorName || detail.factorCode}</span>
              <span className="font-semibold text-stone-700">{detail.factorValue}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </article>
);

export default ProductCard;
