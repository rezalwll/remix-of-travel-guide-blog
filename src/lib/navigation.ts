export const ROUTE_NAVIGATION_START_EVENT = "kiashi:route-navigation-start";

export function announceRouteNavigationStart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_NAVIGATION_START_EVENT));
}
