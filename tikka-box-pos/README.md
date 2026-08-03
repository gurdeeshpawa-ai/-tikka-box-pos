# Tikka Box POS — Updated Working Version

## Included
- iPad-friendly touch interface
- Pickup and dine-in orders
- Quantity controls and order notes
- Michigan sales tax, default 6%
- Cash checkout with automatic change
- External card-terminal checkout
- Receipt printing
- Daily cash/card/order report
- CSV sales export
- Offline cache after first successful load
- Browser local-storage sales data
- Menu & Settings screen
- Add menu items
- Edit menu items
- Delete menu items
- Sold-out switches
- Combo Plate added at $12.99

## Test on a computer
Open a terminal in this folder and run:

    python3 -m http.server 8080

Then visit:

    http://localhost:8080

## Put it on an iPad
1. Upload this folder to an HTTPS website, GitHub Pages, Netlify, or another web host.
2. Open the hosted address in Safari.
3. Tap Share.
4. Tap Add to Home Screen.

## Important
Card payments are recorded only after approval on Square, Clover, or another external terminal.
Sales are stored in the browser. Export the CSV regularly and do not clear Safari website data before exporting.
