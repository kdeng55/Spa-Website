# SPA website

A bright, kid-friendly single-page website with three big boxes. Tap a box and it plays a sound!

## Run it

Open `index.html` in a browser — no build step needed.

## Sounds

| Box | Sound | File |
| --- | --- | --- |
| Pink | Goat | `sounds/goat.m4a` |
| Yellow | Cat | `sounds/cat.m4a` |
| Blue | Cow | `sounds/cow.m4a` |

To swap a sound, drop a new file into `sounds/` and update that box's `data-sound` attribute in `index.html`.

## Offline use

The site works offline after the first visit (a service worker in `sw.js` saves every file). It can also be installed like an app — "Add to Home Screen" on iPhone/iPad, or the install button in Chrome/Edge.

**When you change or add any file**, add it to the `PRECACHE` list in `sw.js` if it's new, and bump `CACHE_VERSION` (e.g. `v1` → `v2`) so visitors get the update.
