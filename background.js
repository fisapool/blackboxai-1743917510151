// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "useAsPurchaseDate",
    title: "Use as Purchase Date",
    contexts: ["selection"]
  });
});

// Handle context menu item click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "useAsPurchaseDate") {
    // Try to parse the selected text as a date
    const selectedText = info.selectionText.trim();
    const parsedDate = tryParseDate(selectedText);
    
    if (parsedDate) {
      // Store the date in chrome.storage
      chrome.storage.local.set({
        contextMenuDate: parsedDate.toISOString().split('T')[0]
      });
    } else {
      console.log("Could not parse date from selection:", selectedText);
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getContextMenuDate") {
    chrome.storage.local.get(['contextMenuDate'], function(data) {
      sendResponse({ date: data.contextMenuDate });
      // Clear the stored date after sending it
      chrome.storage.local.remove('contextMenuDate');
    });
    return true; // Required to use sendResponse asynchronously
  }
});

// Helper function to try parsing various date formats
function tryParseDate(dateString) {
  // Try parsing as ISO format (YYYY-MM-DD)
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;
  
  // Try parsing other common formats
  const formats = [
    'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD',
    'MM-DD-YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD',
    'MMMM DD, YYYY', 'DD MMMM YYYY'
  ];
  
  for (const format of formats) {
    date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
}