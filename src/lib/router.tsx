"use client";

import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { useCallback, useEffect, type AnchorHTMLAttributes, type ReactNode } from "react";

type Destination = string | { pathname?: string; search?: string; hash?: string };

const destinationToHref = (to: Destination) => {
  if (typeof to === "string") return to;
  return `${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}` || "/";
};

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: Destination;
  replace?: boolean;
  children?: ReactNode;
};

export function Link({ to, replace, children, ...props }: LinkProps) {
  return <NextLink href={destinationToHref(to)} replace={replace} {...props}>{children}</NextLink>;
}

type NavLinkState = { isActive: boolean; isPending: boolean };
type NavLinkProps = Omit<LinkProps, "className" | "children"> & {
  end?: boolean;
  className?: string | ((state: NavLinkState) => string);
  children?: ReactNode | ((state: NavLinkState) => ReactNode);
};

export function NavLink({ to, end, className, children, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const href = destinationToHref(to);
  const targetPath = href.split(/[?#]/)[0] || "/";
  const isActive = end ? pathname === targetPath : pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  const state = { isActive, isPending: false };
  return (
    <NextLink href={href} className={typeof className === "function" ? className(state) : className} {...props}>
      {typeof children === "function" ? children(state) : children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return useCallback((to: Destination | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    const href = destinationToHref(to);
    if (options?.replace) router.replace(href);
    else router.push(href);
  }, [router]);
}

export function useLocation() {
  const pathname = usePathname();
  const query = useNextSearchParams();
  const search = query.toString();
  return { pathname, search: search ? `?${search}` : "", hash: "", state: null };
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>) => void] {
  const current = useNextSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = new URLSearchParams(current.toString());
  return [params, (next) => {
    const value = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    router.push(value.size ? `${pathname}?${value}` : pathname);
  }];
}

export function Navigate({ to, replace = false }: { to: Destination; replace?: boolean }) {
  const navigate = useNavigate();
  const href = destinationToHref(to);
  useEffect(() => navigate(href, { replace }), [href, navigate, replace]);
  return null;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const values: Record<string, string> = {};
  if (parts[0] === "destinations") { if (parts[1]) values.continent = parts[1]; if (parts[2]) values.country = parts[2]; }
  if (parts[0] === "blog" && parts[1]) { values.slug = parts[1]; values.articleId = parts[1]; }
  if (parts[0] === "article" && parts[1]) values.articleId = parts[1];
  if (parts[0] === "routes" && parts[1]) values.routeId = parts[1];
  if (parts[0] === "shop" && parts[1]) values.productId = parts[1];
  if (["flights", "hotels", "tours", "ziyarat", "orders"].includes(parts[0] ?? "") && parts[1]) values.id = parts[1];
  if (parts[0] === "visa" && parts[1]) values.country = parts[1];
  if (parts[0] === "account" && parts[1] === "orders" && parts[2]) values.id = parts[2];
  return values as T;
}
