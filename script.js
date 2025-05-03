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

// Check Balance (Using Pi Block Explorer)
async function checkBalance() {
  const balanceDisplay = document.getElementById('balanceDisplay');
  const walletAddress = document.getElementById('walletAddress').textContent;
  
  if (!walletAddress || walletAddress === 'Chưa nhập địa chỉ ví') {
    showToast('Vui lòng nhập địa chỉ ví trước!', 'error');
    return;
  }

  balanceDisplay.textContent = 'Đang kiểm tra...';
  
  try {
    // Replace this with the actual API endpoint for the Pi Block Explorer
    const response = await fetch(`https://blockexplorer.minepi.com/mainnet/accounts/${walletAddress}/json`);
    if (!response.ok) {
      throw new Error('Không thể lấy thông tin số dư');
    }
    
    const data = await response.json();
    const balance = data.balance || '0'; // Adjust based on actual API response structure
    
    balanceDisplay.textContent = `${balance} Pi`;
    showToast('Đã kiểm tra số dư thành công!');
  } catch (error) {
    console.error('Error fetching balance:', error);
    balanceDisplay.textContent = 'Lỗi khi kiểm tra';
    showToast('Không thể kiểm tra số dư!', 'error');
  }
}

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
}

// Hide Edit Modal
function hideEditModal() {
  const editModal = document.getElementById('editModal');
  editModal.classList.remove('show');
  editModal.classList.add('hidden');
}

// Save Changes in Modal
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
  showToast('Đã lưu thay đổi thành công!');
  hideEditModal();
}

// Mock Safety Check (Replace with actual implementation)
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
    
    // Mock result
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

// Mock Check-In (Replace with actual implementation)
function checkIn() {
  const checkInStatus = document.getElementById('checkInStatus');
  checkInStatus.classList.remove('hidden');
  showToast('Điểm danh thành công!');
}

// Mock PP to Pi Conversion (Replace with actual implementation)
function convertPPtoPi() {
  showToast('Đã đổi PP sang Pi thành công!');
  document.getElementById('piBalance').textContent = '10 Pi'; // Mock value
}

// Mock Withdraw Pi (Replace with actual implementation)
function withdrawPi() {
  const withdrawStatus = document.getElementById('withdrawStatus');
  withdrawStatus.textContent = 'Đã gửi yêu cầu rút Pi';
  showToast('Yêu cầu rút Pi đã được gửi!');
}

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  document.getElementById('darkModeToggle').textContent = isDarkMode ? 'Chuyển chế độ sáng' : 'Chuyển chế độ tối';
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});

// Load Dark Mode Preference
document.addEventListener('DOMContentLoaded', () => {
  const darkModePreference = localStorage.getItem('darkMode');
  if (darkModePreference === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').textContent = 'Chuyển chế độ sáng';
  }
});
