"use client";
// Recommendation result UI.

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import AppHeader from "@/components/common/AppHeader";
import ActionSection from "@/components/recommend/sections/ActionSection";
import ProductGridSection from "@/components/recommend/sections/ProductGridSection";
import RecommendHeroSection from "@/components/recommend/sections/RecommendHeroSection";
import RecommendationListSection from "@/components/recommend/sections/RecommendationListSection";
import SimulationSection from "@/components/recommend/sections/SimulationSection";

import { getAccessToken } from "@/infra/auth";
import { useRecommendResult } from "@/hooks/useRecommendResult";
import { useRecommendationList } from "@/hooks/useRecommendationList";
import { useRecommendationExplain } from "@/hooks/useRecommendationExplain";

const splitSummary = (summary: string): string[] => {
  const parts = summary.split(/[\n•]/).map((item) => item.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return parts.slice(0, 3);
  }
  return [
    summary || "입력 조건을 바탕으로 추천을 구성했습니다.",
    "상환 여력을 고려한 상품을 우선 정렬했습니다.",
    "리스크 항목을 함께 확인해 주세요.",
  ];
};

const RecommendResultPage = () => {
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [showExcludedProducts, setShowExcludedProducts] = useState(false);
  const [eligiblePage, setEligiblePage] = useState(1);
  const [excludedPage, setExcludedPage] = useState(1);
  const [listPage, setListPage] = useState(0);
  const listSize = 2;
  const searchParams = useSearchParams();
  const recommendationId = searchParams.get("id");
  const { data, isLoading } = useRecommendResult(recommendationId);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setAccessToken(getAccessToken());
  }, []);

  const { data: listData } = useRecommendationList(listPage, listSize, Boolean(accessToken));
  const { data: explainData } = useRecommendationExplain(recommendationId);

  const explain = explainData ?? data?.explain ?? {
    summary: "추천에 사용된 입력 요약이 표시됩니다.",
    levelUsed: "LV1",
    levelStatus: "empty",
  };
  const reasons = explainData?.reasons ?? [];

  const products = data?.products ?? [
    {
      id: "demo-1",
      lenderName: "대출사명",
      productName: "대출 상품명",
      rate: "금리 월 6.2%",
      limit: "최대 한도 500만원",
      reason: "추천 사유가 표시됩니다.",
      suitabilityScore: 78,
      riskNote: "주의사항이 표시됩니다.",
    },
    {
      id: "demo-2",
      lenderName: "대출사명",
      productName: "대출 상품명",
      rate: "금리 월 6.2%",
      limit: "최대 한도 500만원",
      reason: "추천 사유가 표시됩니다.",
      suitabilityScore: 72,
      riskNote: "주의사항이 표시됩니다.",
    },
    {
      id: "demo-3",
      lenderName: "대출사명",
      productName: "대출 상품명",
      rate: "금리 월 6.0%",
      limit: "최대 한도 700만원",
      reason: "추천 사유가 표시됩니다.",
      suitabilityScore: 69,
      riskNote: "주의사항이 표시됩니다.",
    },
    {
      id: "demo-4",
      lenderName: "대출사명",
      productName: "대출 상품명",
      rate: "금리 월 5.9%",
      limit: "최대 한도 900만원",
      reason: "추천 사유가 표시됩니다.",
      suitabilityScore: 65,
      riskNote: "주의사항이 표시됩니다.",
    },
    {
      id: "demo-5",
      lenderName: "대출사명",
      productName: "대출 상품명",
      rate: "금리 월 6.4%",
      limit: "최대 한도 300만원",
      reason: "추천 사유가 표시됩니다.",
      suitabilityScore: 61,
      riskNote: "주의사항이 표시됩니다.",
    },
  ];

  const detail = data?.detail ?? {
    description: "상품 상세 정보가 표시됩니다.",
    monthlyPaymentExample: "월 상환액 예시가 표시됩니다.",
    riskWarning: "고위험 조건 경고 및 승인 보장 아님 고지가 표시됩니다.",
  };
  const purposeMismatchMessage = "대출 목적이 정책상 허용되지 않습니다.";
  const dsrTooHighMessage = "DSR가 기준을 초과했습니다.";
  const notEligibleMessage = "추천 대상이 아닙니다.";
  const exclusionMessages = [purposeMismatchMessage, dsrTooHighMessage, notEligibleMessage];
  const normalizeReason = (value?: string | null): string => {
    if (!value) return "";
    return value
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, "")
      .trim();
  };
  const normalizedExclusionMessages = exclusionMessages.map((msg) =>
    normalizeReason(msg),
  );
  const hasExclusionReason = (reason?: string | null): boolean => {
    const normalized = normalizeReason(reason);
    if (!normalized) return false;
    if (normalizedExclusionMessages.some((msg) => normalized.includes(msg))) {
      return true;
    }
    return normalized.includes("dsr") || normalized.includes("정책상");
  };
  const eligibleProducts = products.filter(
    (product) => !hasExclusionReason(product.reason),
  );
  const excludedProducts = products.filter((product) =>
    hasExclusionReason(product.reason),
  );
  const eligibleFallbackTags = reasons.filter(
    (reason) => !exclusionMessages.includes(reason),
  );
  const excludedFallbackTags = reasons.filter((reason) =>
    exclusionMessages.includes(reason),
  );
  const productPageSize = 9;
  const eligibleTotalPages = Math.max(1, Math.ceil(eligibleProducts.length / productPageSize));
  const excludedTotalPages = Math.max(1, Math.ceil(excludedProducts.length / productPageSize));
  const eligibleCurrentPage = Math.min(eligiblePage, eligibleTotalPages);
  const excludedCurrentPage = Math.min(excludedPage, excludedTotalPages);
  const eligibleSlice = eligibleProducts.slice(
    (eligibleCurrentPage - 1) * productPageSize,
    eligibleCurrentPage * productPageSize,
  );
  const excludedSlice = excludedProducts.slice(
    (excludedCurrentPage - 1) * productPageSize,
    excludedCurrentPage * productPageSize,
  );
  const eligiblePages = Array.from({ length: eligibleTotalPages }, (_, i) => i + 1);
  const excludedPages = Array.from({ length: excludedTotalPages }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-100 to-amber-50 px-16 py-14">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-9">
        <AppHeader />

        <section className="flex flex-col gap-6 rounded-[32px] border border-stone-200 bg-white/90 p-8 shadow-soft-lg">
          <RecommendHeroSection hasId={Boolean(recommendationId)} isLoading={isLoading} />

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-stone-900">추천 상품</h3>
            <ProductGridSection
              products={eligibleSlice}
              fallbackTags={eligibleFallbackTags}
              showAll={showAllProducts}
              onShowAll={() => setShowAllProducts(true)}
            />
            {eligibleProducts.length > productPageSize && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-500">
                <span>
                  총 {eligibleProducts.length}개 · {eligibleCurrentPage} / {eligibleTotalPages} 페이지
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEligiblePage((prev) => Math.max(1, prev - 1))}
                    disabled={eligibleCurrentPage === 1}
                    className="rounded-full border border-stone-200 px-3 py-1 disabled:opacity-40"
                  >
                    이전
                  </button>
                  {eligiblePages.map((pageNumber) => (
                    <button
                      key={`eligible-page-${pageNumber}`}
                      type="button"
                      onClick={() => setEligiblePage(pageNumber)}
                      className={
                        pageNumber === eligibleCurrentPage
                          ? "rounded-full bg-stone-900 px-3 py-1 text-white"
                          : "rounded-full border border-stone-200 px-3 py-1"
                      }
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setEligiblePage((prev) => Math.min(eligibleTotalPages, prev + 1))
                    }
                    disabled={eligibleCurrentPage === eligibleTotalPages}
                    className="rounded-full border border-stone-200 px-3 py-1 disabled:opacity-40"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-stone-900">
                목적 불일치 및 제외 상품
              </h3>
              <button
                type="button"
                onClick={() => setShowExcludedProducts((prev) => !prev)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700"
              >
                {showExcludedProducts ? "대출 제외 상품 닫기" : "대출 제외 상품 보기"}
              </button>
            </div>
            {showExcludedProducts ? (
              excludedProducts.length > 0 ? (
                <>
                  <ProductGridSection
                    products={excludedSlice}
                    fallbackTags={
                      excludedFallbackTags.length > 0
                        ? excludedFallbackTags
                        : exclusionMessages
                    }
                    showAll={true}
                    onShowAll={() => {}}
                  />
                  {excludedProducts.length > productPageSize && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-500">
                      <span>
                        총 {excludedProducts.length}개 · {excludedCurrentPage} / {excludedTotalPages} 페이지
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExcludedPage((prev) => Math.max(1, prev - 1))}
                          disabled={excludedCurrentPage === 1}
                          className="rounded-full border border-stone-200 px-3 py-1 disabled:opacity-40"
                        >
                          이전
                        </button>
                        {excludedPages.map((pageNumber) => (
                          <button
                            key={`excluded-page-${pageNumber}`}
                            type="button"
                            onClick={() => setExcludedPage(pageNumber)}
                            className={
                              pageNumber === excludedCurrentPage
                                ? "rounded-full bg-stone-900 px-3 py-1 text-white"
                                : "rounded-full border border-stone-200 px-3 py-1"
                            }
                          >
                            {pageNumber}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setExcludedPage((prev) => Math.min(excludedTotalPages, prev + 1))
                          }
                          disabled={excludedCurrentPage === excludedTotalPages}
                          className="rounded-full border border-stone-200 px-3 py-1 disabled:opacity-40"
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-stone-200 bg-white px-6 py-8 text-center text-sm text-stone-500">
                  제외된 상품이 없습니다.
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-6 py-6 text-center text-xs text-stone-500">
                제외된 상품을 보려면 버튼을 눌러주세요.
              </div>
            )}
          </div>

          <SimulationSection monthlyPaymentExample={detail.monthlyPaymentExample} />

          <RecommendationListSection
            items={listData?.items ?? []}
            page={listData?.page ?? listPage}
            size={listData?.size ?? listSize}
            total={listData?.total ?? 0}
            onPageChange={setListPage}
          />

          <ActionSection />
        </section>
      </div>
    </main>
  );
};

export default RecommendResultPage;
