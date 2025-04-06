# Subscription Refund Calculator Chrome Extension

A Chrome extension that calculates subscription refunds based on:
- Purchase date
- Refund request date 
- Subscription amount
- Subscription duration

## Features

- 🗓️ Date pickers for purchase and refund dates
- 💰 Amount input with validation
- ⏳ Duration selection (1 Week, 1 Month, 3 Months, 6 Months)
- 📊 Visual progress bar showing usage
- 📋 Calculation history (last 5 calculations)
- 🖱️ Right-click context menu to select dates from web pages
- 🎨 Modern UI with Tailwind CSS

## Installation

1. Clone this repository:
```bash
git clone https://github.com/fisapool/Subscription-Refund-Calculator.git
```

2. Load into Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the cloned directory

## Usage

1. Click the extension icon in Chrome's toolbar
2. Enter:
   - Purchase date
   - Refund date (defaults to today)
   - Subscription amount (RM)
   - Subscription duration
3. Click "Calculate" to see your refund amount
4. Right-click dates on web pages and select "Use as Purchase Date"

## Screenshots

![Extension Popup](https://via.placeholder.com/400x600/3b82f6/ffffff?text=Refund+Calculator+Popup)
![Context Menu](https://via.placeholder.com/400x200/3b82f6/ffffff?text=Right-click+Date+Selection)

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Main UI
- `popup.js` - Calculation logic
- `background.js` - Context menu handler

## License

MIT# Subscription-Refund-Calculator
