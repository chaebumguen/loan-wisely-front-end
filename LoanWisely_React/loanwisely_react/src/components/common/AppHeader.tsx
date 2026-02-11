"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { verifyUser } from "@/api/authApi";
import { clearAccessToken, getAccessToken, getAccessTokenExpiry } from "@/infra/auth";

type AppHeaderProps = {
  variant?: "default" | "compact";
};

const AppHeader = ({ variant = "default" }: AppHeaderProps) => {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setHasToken(false);
      return;
    }

    const expiresAt = getAccessTokenExpiry();
    if (expiresAt !== null && Date.now() >= expiresAt) {
      clearAccessToken();
      setHasToken(false);
      return;
    }

    verifyUser()
      .then(() => setHasToken(true))
      .catch(() => {
        clearAccessToken();
        setHasToken(false);
      });
  }, []);

  const pathname = usePathname();
  const loginHref = useMemo(() => {
    if (!pathname) {
      return "/login";
    }
    return `/login?redirect=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  const handleLogout = () => {
    clearAccessToken();
    setHasToken(false);
  };

  const links = [
    { label: "홈", href: "/" },
    { label: "추천 시작", href: "/user" },
    { label: "전체 상품 조회", href: "/product" },
    { label: "FAQ", href: "/consent" },
  ];

  const isCompact = variant === "compact";

  return (
    <header
      className={
        isCompact
          ? "rounded-[24px] border border-stone-200 bg-white/90 px-4 py-4 shadow-soft-lg sm:rounded-[28px] sm:px-8 sm:py-5"
          : "flex flex-col items-start justify-between gap-4 rounded-[24px] border border-stone-200 bg-white/90 px-4 py-4 shadow-soft-lg sm:flex-row sm:items-center sm:gap-6 sm:rounded-[28px] sm:px-8 sm:py-5"
      }
    >
      <a
        href="/"
        className="flex items-center gap-4"
        aria-label="LoanWisely"
      >
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-200 text-stone-900 shadow-sm sm:h-12 sm:w-12">
          LW
        </div>
        <div>
          <div className="text-base font-semibold tracking-wide text-stone-900 sm:text-lg">
            LOAN WISELY
          </div>
          <div className="text-xs text-stone-500 sm:text-sm">
            맞춤 금융상품 추천 서비스
          </div>
        </div>
      </a>
      {variant === "default" ? (
        <nav className="w-full sm:ml-auto sm:w-auto" aria-label="Global">
          <ul className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-700 sm:flex-nowrap sm:justify-end sm:gap-3 sm:text-sm">
            {links.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="whitespace-nowrap rounded-full border border-stone-200 bg-white/90 px-3 py-1.5 transition hover:border-stone-300 hover:text-stone-900 sm:px-4 sm:py-2"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              {hasToken ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="whitespace-nowrap rounded-full border border-stone-200 bg-white/90 px-3 py-1.5 transition hover:border-stone-300 hover:text-stone-900 sm:px-4 sm:py-2"
                >
                  로그아웃
                </button>
              ) : (
                <a
                  href={loginHref}
                  className="whitespace-nowrap rounded-full border border-stone-200 bg-white/90 px-3 py-1.5 transition hover:border-stone-300 hover:text-stone-900 sm:px-4 sm:py-2"
                >
                  로그인
                </a>
              )}
            </li>
            {!hasToken ? (
              <li>
                <a
                  href="/signup"
                  className="whitespace-nowrap rounded-full border border-stone-200 bg-white/90 px-3 py-1.5 transition hover:border-stone-300 hover:text-stone-900 sm:px-4 sm:py-2"
                >
                  회원가입
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
};

export default AppHeader;

