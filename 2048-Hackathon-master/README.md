# 2048
A small clone of [1024](https://play.google.com/store/apps/details?id=com.veewo.a1024), based on [Saming's 2048](http://saming.fr/p/2048/) (also a clone). 2048 was indirectly inspired by [Threes](https://asherv.com/threes/).

Made just for fun. [Play it here!](http://gabrielecirulli.github.io/2048/)

The official app can also be found on the [Play Store](https://play.google.com/store/apps/details?id=com.gabrielecirulli.app2048) and [App Store!](https://itunes.apple.com/us/app/2048-by-gabriele-cirulli/id868076805)

### Contributions

[Anna Harren](https://github.com/iirelu/) and [sigod](https://github.com/sigod) are maintainers for this repository.

Other notable contributors:

 - [TimPetricola](https://github.com/TimPetricola) added best score storage
 - [chrisprice](https://github.com/chrisprice) added custom code for swipe handling on mobile
 - [marcingajda](https://github.com/marcingajda) made swipes work on Windows Phone
 - [mgarciaisaia](https://github.com/mgarciaisaia) added support for Android 2.3

Many thanks to [rayhaanj](https://github.com/rayhaanj), [Mechazawa](https://github.com/Mechazawa), [grant](https://github.com/grant), [remram44](https://github.com/remram44) and [ghoullier](https://github.com/ghoullier) for the many other good contributions.

### Screenshot

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1175750/8614312/280e5dc2-26f1-11e5-9f1f-5891c3ca8b26.png" alt="Screenshot"/>
</p>

That screenshot is fake, by the way. I never reached 2048 :smile:

---

## Accessibility Improvements

This fork adds a full accessibility pass to bring the game closer to WCAG 2.1 AA compliance.

### ARIA & Screen Reader Support

- `<html lang="en">` added for correct screen reader language selection
- `role="application"` and `aria-label="2048 game board"` on the game container
- `aria-live="polite"` and `aria-atomic="false"` on the tile container — every move is announced without interrupting speech
- Each rendered tile gets an `aria-label` describing its value and position (e.g. *"4 at row 2 column 3"*); ghost merge-source tiles are hidden with `aria-hidden="true"` to avoid double-reading
- `role="alert"` and `aria-live="assertive"` on the win/loss overlay — the result is announced immediately
- Score containers use `role="status"`, `aria-live="polite"`, and a live `aria-label` (e.g. *"Score: 128"*) updated on every move; the animated `+N` delta is `aria-hidden` to avoid duplicate announcements
- The decorative grid background (`div.grid-container`) is `aria-hidden="true"`

### Keyboard Access

- All three action buttons (`New Game`, `Keep going`, `Try again`) were `<a>` tags without `href` — not focusable or operable by keyboard. They now have `role="button"` and `tabindex="0"`
- `Enter` and `Space` key handlers added to all buttons via `bindButtonPress`
- Focus is programmatically moved to the win/loss overlay when it appears, landing keyboard users directly on the action buttons

### High Contrast Mode

A toggleable high contrast mode is available via the **High contrast** button above the game board. The preference is saved to `localStorage` and restored on the next visit.

**What changes in high contrast mode:**

- Page background: black (`#000`)
- All text: white (`#fff`)
- Game board, score boxes, and buttons: dark `#111` backgrounds with white borders
- `box-sizing: border-box` applied to every bordered element so no layout dimensions change — tiles remain perfectly aligned with their grid cells
- Each tile value gets a **unique dark hued background** spanning the full tile face, with a matching bright rim border and white text. All combinations meet WCAG AA contrast (≥ 4.5:1):

| Tile | Hue | Background | Border |
|------|-----|------------|--------|
| 2 | Slate | `#1c1c2e` | `#9999cc` |
| 4 | Navy | `#0a1628` | `#4477cc` |
| 8 | Teal | `#003333` | `#00bbbb` |
| 16 | Green | `#003300` | `#00cc44` |
| 32 | Yellow-green | `#1a1a00` | `#aacc00` |
| 64 | Amber | `#1f1400` | `#cc8800` |
| 128 | Orange | `#1f0d00` | `#ff6600` |
| 256 | Red-orange | `#200000` | `#ff3300` |
| 512 | Crimson | `#1a0010` | `#cc0044` |
| 1024 | Magenta | `#1a0033` | `#cc00cc` |
| 2048 ★ | Violet | `#0d0022` | `#aa44ff` |
| Super | Near-black | `#050505` | `#ffffff` |

- Focus rings changed to yellow (`#ffff00`) — the highest-contrast focus indicator against dark backgrounds, matching OS-level forced-colour conventions

### New files

| File | Purpose |
|------|---------|
| `style/high-contrast.css` | All high contrast overrides, scoped under `body.high-contrast` |
| `js/high_contrast.js` | Toggle logic: adds/removes the body class, persists preference in `localStorage` |

---

## Contributing
Changes and improvements are more than welcome! Feel free to fork and open a pull request. Please make your changes in a specific branch and request to pull into `master`! If you can, please make sure the game fully works before sending the PR, as that will help speed up the process.

You can find the same information in the [contributing guide.](https://github.com/gabrielecirulli/2048/blob/master/CONTRIBUTING.md)

## License
2048 is licensed under the [MIT license.](https://github.com/gabrielecirulli/2048/blob/master/LICENSE.txt)

## Donations
I made this in my spare time, and it's hosted on GitHub (which means I don't have any hosting costs), but if you enjoyed the game and feel like buying me coffee, you can donate at my BTC address: `1Ec6onfsQmoP9kkL3zkpB6c5sA4PVcXU2i`. Thank you very much!
