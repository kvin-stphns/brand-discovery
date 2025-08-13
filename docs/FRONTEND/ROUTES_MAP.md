# Frontend Routes Map (App Router)

- `/` Home
- `/discover` Discover hub
- `/discover/map` Interactive map (GeoMap)
- `/explore` Explore (mixed feed across categories)
- `/featured` Featured grid
- `/popular` Popular grid
- `/brand/[id]` Brand detail
- `/designer/[id]` Designer detail
- `/product/[id]` Product detail
- `/:category/:section/:subsection` Category grid
- `/:category/:section/view-all` List view
- `/login` Login
- `/signup` Signup
- `/liked` Liked items
- `/saved` Saved items
- `/submissions` Submissions
- `/about` About
- `/contact` Contact
- `/faq` FAQ
- `/privacy` Privacy
- `/rankings` Rankings overview

All links unified via `lib/nav.ts::hrefFor()`. `MegaMenu` and `MobileMenu` consume this for internal routing.