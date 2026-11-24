export const ROUTE_NAVIGATION_START_EVENT = "kiashi:route-navigation-start";

export function routeLoadingKey(pathname: string, search: string) {
  return `${pathname}?${new URLSearchParams(search).toString()}`;
}

export function announceRouteNavigationStart(href?: string) {
  if (typeof window === "undefined") return;
  if (href) {
    const current = new URL(window.location.href);
    const destination = new URL(href, current);
    if (current.origin !== destination.origin ||
      routeLoadingKey(current.pathname, current.search) === routeLoadingKey(destination.pathname, destination.search)) return;
  }
  window.dispatchEvent(new Event(ROUTE_NAVIGATION_START_EVENT));
}
