# Tikka Box POS — First Working Version

## What is included
- iPad-friendly touch interface
- Tikka Box logo and branding
- Menu categories and large item buttons
- Pickup and dine-in orders
- Quantity controls and order notes
- Michigan sales-tax calculation (default 6%)
- Cash checkout with automatic change
- External card-terminal checkout
- Customer receipt printing
- Kitchen-ticket printing
- Daily cash/card/order reports
- CSV sales export
- Editable prices and sold-out switches
- Offline cache after the first successful load
- Sales stored locally on the iPad/browser

## Important
This version does not directly process credit cards. The "Card Terminal" button records a card sale after the payment is approved on Square, Clover, or another terminal. Direct Square integration requires the merchant's Square account, application ID, location ID, and supported reader/terminal setup.

Data is stored only in the browser's local storage. Do not clear Safari website data unless the sales have first been exported.

## Fast test on a computer
Open a terminal in this folder and run:

    python3 -m http.server 8080

Then visit:

    http://localhost:8080

## Put it on the iPad
The folder must be hosted on an HTTPS website or local network web server.

1. Open the hosted address in Safari on the iPad.
2. Tap the Share button.
3. Tap "Add to Home Screen."
4. Open "Tikka Box POS" from the new icon.

## Menu assumptions that can be changed inside the app
- Bowls: $10.99
- Tacos: $3.99
- French fries: $3.49
- Soft drink: $1.99
- Chicken Kebab Burger Combo: $9.99 total

Open **Menu & Settings** to correct any prices.
