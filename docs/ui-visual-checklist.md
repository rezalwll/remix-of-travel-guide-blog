# UI visual certification checklist

This checklist is the stable route inventory for the image-rich UI lockdown. Runtime screenshots are Playwright artifacts and are intentionally not committed.

## Discovery and SEO

- `/` — cinematic hero, attached booking search, service discovery, route cards, destinations, stays, experiences, editorial and support banner.
- `/flights` and `/flights/tehran-to-mashhad` — aviation hero, search, destination context and route cross-sell.
- `/hotels`, `/hotels/kish`, and demo hotel detail routes — photo-first discovery, stable gallery and search cards.
- `/tours`, `/ziyarat`, `/trains`, `/buses`, `/insurance`, `/cip`, `/transfer`, `/visa`, `/fast-track`, `/esim`, `/city-tours` — service-specific hero and relevant media, not interchangeable stock imagery.
- `/destinations`, `/destinations/iran/kish` — image-first index, themed collections, detail mosaic and booking cross-sell.
- `/blog`, `/blog/kish-travel-guide` — editorial hierarchy, cover media, contextual image and destination CTA.
- `/support` — warm support hero, scannable help categories, searchable FAQ and tracking CTA.

## Transactional and private

- `/flights/search?...` — information-first results with branded failure and empty states.
- `/hotels/search?...` — photo-first hotel cards; filters remain usable on mobile.
- `/auth/login` — desktop split visual layout and mobile form-first layout.
- `/checkout/review` — compact selected-product imagery only; no marketing hero.
- `/account/trips` — compact contextual thumbnails; dashboard hierarchy remains primary.
- `/track-order` — small contextual visual; status and identifiers remain dominant.
- `/route-that-does-not-exist` — branded 404 with serious, actionable copy.

## Breakpoints and checks

- Automated overflow matrix: 320, 360, 390, 430, 768, 1024, 1280 and 1440 pixels.
- Playwright projects: desktop Chromium and Pixel 7.
- Automated checks: first H1 visible, no broken rendered image, no horizontal overflow, route status correct.
- Screenshot artifacts: home, flights, hotels, destinations, blog, support and login on desktop and mobile.
- Manual review: hero crop, text contrast, booking/search overlap, RTL arrows and rails, keyboard focus, card density and footer rhythm.
