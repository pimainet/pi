// Global variable to store authenticated user data
let authUser = null;

// Show Toast Notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  toastMessage.textContent = message;
  toast.classList.remove('bg-green-500', 'bg-red-500');
  toast.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500');
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 3000);
}

// Load user data from localStorage
function loadUserData() {
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const urlParams = new URLSearchParams(window.location.search);
  const tagId = urlParams.get('tag_id');
  if (tagId === '001' && !userData.userName) {
    userData.userName = 'Hoàng Văn Minh';
  }
  if (userData.userName) {
    document.getElementById('userName').textContent = userData.userName;
  }
  if (userData.walletAddress) {
    document.getElementById('walletAddress').textContent = userData.walletAddress;
  }
  saveUserData(userData.userName, userData.walletAddress);
}

// Save user data to localStorage
function saveUserData(userName, walletAddress) {
  const userData = { userName, walletAddress };
  localStorage.setItem('userData', JSON.stringify(userData));
}

// Auto-check balance from URL
function autoCheckBalanceFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const walletAddress = urlParams.get('wallet');
  if (walletAddress) {
    document.getElementById('walletAddress').textContent = walletAddress;
    saveUserData(document.getElementById('userName').textContent, walletAddress);
    checkBalance();
  }
}

// Check Balance (Scrape from Pi Block Explorer)
async function checkBalance() {
  const balanceDisplay = document.getElementById('balanceDisplay');
  const walletAddress = document.getElementById('walletAddress').textContent;

  if (!walletAddress || walletAddress === 'Chưa nhập địa chỉ ví') {
    balanceDisplay.textContent = 'Chưa nhập địa chỉ ví';
    showToast('Vui lòng nhập địa chỉ ví trước!', 'error');
    return;
  }

  balanceDisplay.textContent = 'Đang kiểm tra...';

  try {
    const response = await fetch(`https://blockexplorer.minepi.com/mainnet/accounts/${walletAddress}`);
    if (!response.ok) {
      throw new Error('Không thể truy cập trình khám phá');
    }
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const balanceElement = doc.querySelector('span.account-balance'); // Điều chỉnh selector dựa trên thực tế
    const balance = balanceElement ? balanceElement.textContent.trim().replace(' PI', '') : '0';
    balanceDisplay.textContent = `${balance} Pi`;
    document.getElementById('withdrawBalance').textContent = `${balance} Pi`;
    showToast('Đã kiểm tra số dư thành công!');
  } catch (error) {
    console.error('Error fetching balance:', error);
    balanceDisplay.textContent = 'Lỗi khi kiểm tra';
    showToast('Không thể kiểm tra số dư!', 'error');
  }
}

// Authenticate User on Load
const scopes = ['username', 'payments'];
function onIncompletePaymentFound(payment) {
  console.log('Incomplete payment found:', payment);
  fetch('/incomplete-payment', {
    method: 'POST',
    body: JSON.stringify({ payment }),
    headers: { 'Content-Type': 'application/json' }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  autoCheckBalanceFromURL();

  Pi.authenticate(scopes, onIncompletePaymentFound).then(auth => {
    console.log('Authenticated:', auth);
    authUser = auth;
    const userName = auth.user.username || document.getElementById('userName').textContent;
    document.getElementById('userName').textContent = userName;
    saveUserData(userName, document.getElementById('walletAddress').textContent);
    showToast('Đã đăng nhập thành công!');
  }).catch(error => {
    console.error('Authentication error:', error);
    showToast('Không thể đăng nhập! Vui lòng mở ứng dụng trong Pi Browser.', 'error');
  });

  const darkModePreference = localStorage.getItem('darkMode');
  if (darkModePreference === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').textContent = 'Chuyển chế độ sáng';
  }
});

// Copy Wallet Address
function copyWalletAddress() {
  const walletAddress = document.getElementById('walletAddress').textContent;
  navigator.clipboard.writeText(walletAddress).then(() => {
    showToast('Đã sao chép địa chỉ ví!');
  }).catch(() => {
    showToast('Không thể sao chép địa chỉ ví!', 'error');
  });
}

// Show Edit Modal
function showEditModal() {
  const editModal = document.getElementById('editModal');
  editModal.classList.remove('hidden');
  editModal.classList.add('show');
  // Populate modal with current values
  document.getElementById('editUserName').value = document.getElementById('userName').textContent;
  document.getElementById('editWalletAddress').value = document.getElementById('walletAddress').textContent;
}

// Hide Edit Modal
function hideEditModal() {
  const editModal = document.getElementById('editModal');
  editModal.classList.remove('show');
  editModal.classList.add('hidden');
}

// Save Changes in Edit Modal
function saveChanges() {
  const userName = document.getElementById('editUserName').value;
  const walletAddress = document.getElementById('editWalletAddress').value;
  const password = document.getElementById('passwordInput').value;

  if (!userName || !walletAddress || !password) {
    showToast('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }

  document.getElementById('userName').textContent = userName;
  document.getElementById('walletAddress').textContent = walletAddress;
  saveUserData(userName, walletAddress);
  checkBalance(); // Update balance after changing wallet address
  showToast('Đã lưu thay đổi thành công!');
  hideEditModal();
}

// Show Withdraw Modal
function showWithdrawModal() {
  if (!authUser) {
    showToast('Vui lòng đăng nhập trước!', 'error');
    return;
  }
  const withdrawModal = document.getElementById('withdrawModal');
  withdrawModal.classList.remove('hidden');
  withdrawModal.classList.add('show');
}

// Hide Withdraw Modal
function hideWithdrawModal() {
  const withdrawModal = document.getElementById('withdrawModal');
  withdrawModal.classList.remove('show');
  withdrawModal.classList.add('hidden');
}

// Withdraw Pi (Mock A2U Payment - Requires Backend)
function withdrawPi() {
  const amount = parseFloat(document.getElementById('withdrawAmount').value);
  const password = document.getElementById('withdrawPassword').value;
  const withdrawStatus = document.getElementById('withdrawStatus');

  if (!amount || amount < 0.01) {
    showToast('Số lượng Pi phải lớn hơn 0 và tối thiểu 1$!', 'error');
    return;
  }

  if (!password) {
    showToast('Vui lòng nhập mật khẩu!', 'error');
    return;
  }

  withdrawStatus.textContent = 'Đang xử lý...';

  setTimeout(() => {
    withdrawStatus.textContent = 'Đã gửi yêu cầu rút Pi';
    showToast('Yêu cầu rút Pi đã được gửi!');
    hideWithdrawModal();
  }, 1500);
}

// PP to Pi Conversion (U2A Payment)
function convertPPtoPi() {
  if (!authUser) {
    showToast('Vui lòng đăng nhập trước!', 'error');
    return;
  }

  Pi.createPayment({
    amount: 10,
    memo: "Chuyển PP sang Pi",
    metadata: { type: "PPtoPi" }
  }, {
    onReadyForServerApproval: paymentId => {
      fetch('/approve-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentId }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onReadyForServerCompletion: (paymentId, txid) => {
      fetch('/complete-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentId, txid }),
        headers: { 'Content-Type': 'application/json' }
      });
      document.getElementById('piBalance').textContent = '10 Pi';
      showToast('Đã đổi PP sang Pi thành công!');
    },
    onCancel: paymentId => showToast('Đã hủy chuyển đổi!', 'error'),
    onError: (error, payment) => showToast('Lỗi khi chuyển đổi!', 'error')
  });
}

// Safety Check (Mock)
function checkSafety() {
  const checkButton = document.getElementById('checkButton');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const safetyResult = document.getElementById('safetyResult');
  const safetyStatus = document.getElementById('safetyStatus');
  const safetyScore = document.getElementById('safetyScore');
  const safetyWarnings = document.getElementById('safetyWarnings');

  checkButton.disabled = true;
  loadingSpinner.style.display = 'block';
  safetyResult.classList.add('hidden');

  setTimeout(() => {
    loadingSpinner.style.display = 'none';
    safetyResult.classList.remove('hidden');
    
    const isSafe = Math.random() > 0.5;
    safetyResult.classList.remove('safe', 'unsafe');
    safetyResult.classList.add(isSafe ? 'safe' : 'unsafe');
    safetyStatus.textContent = isSafe ? 'An toàn' : 'Không an toàn';
    safetyScore.textContent = isSafe ? '85' : '30';
    safetyWarnings.textContent = isSafe ? 'Không có cảnh báo' : 'Trang web có thể không đáng tin cậy';

    checkButton.disabled = false;
    showToast(isSafe ? 'Kiểm tra thành công: An toàn!' : 'Kiểm tra thành công: Không an toàn!', isSafe ? 'success' : 'error');
  }, 1500);
}

// Clear Safety Check Form
function clearForm() {
  document.getElementById('safetyUrl').value = '';
  document.getElementById('safetyResult').classList.add('hidden');
  showToast('Đã xóa biểu mẫu!');
}

// Check-In (Mock)
function checkIn() {
  if (!authUser) {
    showToast('Vui lòng đăng nhập trước!', 'error');
    return;
  }
  const checkInStatus = document.getElementById('checkInStatus');
  checkInStatus.classList.remove('hidden');
  showToast('Điểm danh thành công!');
}

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  document.getElementById('darkModeToggle').textContent = isDarkMode ? 'Chuyển chế độ sáng' : 'Chuyển chế độ tối';
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});
