// Check for context menu date when popup opens
chrome.runtime.sendMessage({action: "getContextMenuDate"}, function(response) {
  if (response && response.date) {
    document.getElementById('purchaseDate').value = response.date;
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const purchaseDateInput = document.getElementById('purchaseDate');
  const refundDateInput = document.getElementById('refundDate');
  const amountInput = document.getElementById('amount');
  const durationSelect = document.getElementById('duration');
  const calculateBtn = document.getElementById('calculate');
  const clearBtn = document.getElementById('clear');
  const resultDiv = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const errorDiv = document.getElementById('error');
  const errorText = document.getElementById('errorText');
  const progressBar = document.getElementById('progressBar');
  const daysUsedSpan = document.getElementById('daysUsed');
  const daysRemainingSpan = document.getElementById('daysRemaining');
  const toggleHistoryBtn = document.getElementById('toggleHistory');
  const historyContainer = document.getElementById('historyContainer');
  const historyItems = document.getElementById('historyItems');

  // Set today's date as default for refund date
  const today = new Date().toISOString().split('T')[0];
  refundDateInput.value = today;

  // Load saved data from storage
  chrome.storage.local.get(['lastCalculation', 'history'], function(data) {
    if (data.lastCalculation) {
      const calc = data.lastCalculation;
      purchaseDateInput.value = calc.purchaseDate;
      refundDateInput.value = calc.refundDate;
      amountInput.value = calc.amount;
      durationSelect.value = calc.duration;
    }

    if (data.history) {
      renderHistory(data.history);
    }
  });

  // Calculate button click handler
  calculateBtn.addEventListener('click', calculateRefund);

  // Clear button click handler
  clearBtn.addEventListener('click', function() {
    purchaseDateInput.value = '';
    refundDateInput.value = today;
    amountInput.value = '';
    durationSelect.value = '7';
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
  });

  // Toggle history visibility
  toggleHistoryBtn.addEventListener('click', function() {
    const isHidden = historyContainer.classList.contains('hidden');
    historyContainer.classList.toggle('hidden');
    toggleHistoryBtn.innerHTML = isHidden 
      ? '<i class="fas fa-history mr-1"></i> Hide History' 
      : '<i class="fas fa-history mr-1"></i> Show History';
  });

  // Main calculation function
  function calculateRefund() {
    // Reset UI
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    // Get input values
    const purchaseDate = new Date(purchaseDateInput.value);
    const refundDate = new Date(refundDateInput.value);
    const amount = parseFloat(amountInput.value);
    const duration = parseInt(durationSelect.value);

    // Validate inputs
    if (!purchaseDateInput.value || !refundDateInput.value || isNaN(amount) || isNaN(duration)) {
      showError('Please fill in all fields with valid values');
      return;
    }

    if (purchaseDate > refundDate) {
      showError('Refund date must be after purchase date');
      return;
    }

    if (amount <= 0) {
      showError('Amount must be greater than 0');
      return;
    }

    // Calculate days used and remaining
    const timeDiff = refundDate - purchaseDate;
    const daysUsed = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const daysRemaining = duration - daysUsed;

    // Handle edge cases
    if (daysUsed <= 0) {
      showResult('RM 0.00 (No time used)', 0, 0, duration);
      return;
    }

    if (daysRemaining <= 0) {
      showResult('RM 0.00 (No time remaining)', duration, 0, duration);
      return;
    }

    // Calculate refund amount
    const dailyRate = amount / duration;
    const refundAmount = daysRemaining * dailyRate;

    // Show result
    showResult(
      `RM ${refundAmount.toFixed(2)}`, 
      daysUsed, 
      daysRemaining, 
      duration
    );

    // Save calculation to storage
    saveCalculation({
      purchaseDate: purchaseDateInput.value,
      refundDate: refundDateInput.value,
      amount: amount,
      duration: duration,
      refundAmount: refundAmount.toFixed(2),
      daysUsed: daysUsed,
      daysRemaining: daysRemaining,
      timestamp: new Date().toISOString()
    });
  }

  function showResult(text, daysUsed, daysRemaining, totalDays) {
    resultText.textContent = text;
    daysUsedSpan.textContent = `${daysUsed} days used`;
    daysRemainingSpan.textContent = `${daysRemaining} days remaining`;
    
    const usedPercentage = (daysUsed / totalDays) * 100;
    progressBar.style.width = `${usedPercentage}%`;
    
    resultDiv.classList.remove('hidden');
  }

  function showError(message) {
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
  }

  function saveCalculation(calculation) {
    chrome.storage.local.get(['history'], function(data) {
      const history = data.history || [];
      
      // Add new calculation to beginning of array
      history.unshift(calculation);
      
      // Keep only last 5 calculations
      if (history.length > 5) {
        history.pop();
      }
      
      // Save to storage
      chrome.storage.local.set({
        lastCalculation: {
          purchaseDate: calculation.purchaseDate,
          refundDate: calculation.refundDate,
          amount: calculation.amount,
          duration: calculation.duration
        },
        history: history
      }, function() {
        renderHistory(history);
      });
    });
  }

  function renderHistory(history) {
    historyItems.innerHTML = '';
    
    if (history.length === 0) {
      historyItems.innerHTML = '<p class="text-gray-500 text-sm">No history yet</p>';
      return;
    }
    
    history.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item p-2 text-sm rounded hover:bg-gray-100';
      historyItem.innerHTML = `
        <div class="flex justify-between">
          <span class="font-medium">RM ${item.refundAmount}</span>
          <span class="text-gray-500 text-xs">${new Date(item.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="text-xs text-gray-500">${item.daysUsed}d used / ${item.daysRemaining}d remaining</div>
      `;
      
      historyItem.addEventListener('click', function() {
        purchaseDateInput.value = item.purchaseDate;
        refundDateInput.value = item.refundDate;
        amountInput.value = item.amount;
        durationSelect.value = item.duration;
      });
      
      historyItems.appendChild(historyItem);
    });
  }
});