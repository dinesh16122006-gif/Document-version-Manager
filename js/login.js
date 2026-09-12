/**
 * DOCUMENT VERSION MANAGER - Login Controller
 * Handles mobile validation and OTP initiation
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, offer quick jump to dashboard
  if (DVM.isLoggedIn()) {
    const banner = document.getElementById('alreadyLoggedInBanner');
    if (banner) banner.style.display = 'block';
  }

  const loginForm = document.getElementById('loginForm');
  const mobileInput = document.getElementById('mobileInput');
  const mobileError = document.getElementById('mobileError');

  if (!loginForm || !mobileInput) return;

  // Allow only digits and limit to 10
  mobileInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    if (mobileError) mobileError.style.display = 'none';
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = mobileInput.value.trim();

    // Indian mobile validation: exactly 10 digits, starts with 6, 7, 8, or 9
    const isValidIndianMobile = /^[6-9]\d{9}$/.test(val);

    if (!isValidIndianMobile) {
      if (mobileError) {
        mobileError.textContent = "Please enter a valid 10-digit mobile number.";
        mobileError.style.display = 'block';
      }
      mobileInput.focus();
      return;
    }

    // Store mobile temporarily for OTP screen
    localStorage.setItem('dvm_temp_mobile', val);
    
    // Visual feedback
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Sending OTP...';
    }

    setTimeout(() => {
      window.location.href = 'otp.html';
    }, 600);
  });
});
