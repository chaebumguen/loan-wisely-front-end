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

const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return value.toFixed(2);
};

const formatRateText = (value: string): string => {
  if (!value) {
    return "-";
  }
  return value.replace(/(\d+(\.\d+)?)/g, (match) => {
    const parsed = Number(match);
    if (Number.isNaN(parsed)) {
      return match;
    }
    return parsed.toFixed(2);
  });
};

const formatLimitValue = (raw: string): string => {
  if (!raw) {
    return "-";
  }
  const trimmed = raw.trim();
  if (!/^[\d,.\s]+$/.test(trimmed)) {
    return raw;
  }
  const numeric = Number(trimmed.replace(/[^\d.]/g, ""));
  if (Number.isNaN(numeric)) {
    return raw;
  }
  const man = Math.floor(numeric / 10000);
  if (man > 0) {
    return `${man.toLocaleString()}만원`;
  }
  return `${numeric.toLocaleString()}원`;
};

const translateFactorName = (name: string, code: string): string => {
  const normalized = name || code;
  const map: Record<string, string> = {
    "Estimated Limit": "추정 한도",
    "Maximum Rate": "최대 금리",
    "Minimum Rate": "최소 금리",
    "Matching Score": "적합도",
  };
  return map[normalized] ?? normalized;
};

const normalizeLenderName = (value: string): string => {
  const match = value.match(/^Provider\s+(\d+)$/i);
  if (match && match[1]) {
    return `금융사 ${match[1]}`;
  }
  return value;
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
}: ProductCardProps) => {
  const formattedRate = formatRateText(rate);
  const formattedLimit = /^[\d,.\s]+$/.test(limit.trim())
    ? `한도 ${formatLimitValue(limit)}`
    : limit;
  const lenderLabel = normalizeLenderName(lenderName);

  return (
    <article className="rounded-3xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-xs text-stone-500">{lenderLabel}</div>
          <h2 className="text-lg font-semibold text-stone-900">{productName}</h2>
          <div className="mt-2 text-sm text-stone-600">{formattedRate}</div>
          <div className="text-sm text-stone-600">{formattedLimit}</div>
        </div>
        <button
          type="button"
          className="h-10 rounded-full border border-stone-400 px-4 text-sm font-semibold text-stone-700"
        >
          상세 보기
        </button>
      </div>
      <div className="mt-4 text-sm text-stone-600">
        <span className="font-semibold text-stone-800">적합도:</span> {formatNumber(suitabilityScore)}점
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
            {estimationDetails
              .filter((detail) => detail.factorCode?.toUpperCase() !== "SCORE")
              .map((detail) => (
                <div key={`${id}-${detail.factorCode}-${detail.factorValue}`} className="flex justify-between gap-3">
                  <span>{translateFactorName(detail.factorName, detail.factorCode)}</span>
                  <span className="font-semibold text-stone-700">
                    {detail.factorCode?.toUpperCase().includes("LIMIT")
                      ? formatLimitValue(detail.factorValue)
                      : formatNumber(Number(detail.factorValue))}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default ProductCard;
