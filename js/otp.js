/**
 * DOCUMENT VERSION MANAGER - OTP Verification Controller
 * Handles 6-box input navigation, paste, 30s resend timer, and verification
 */

document.addEventListener('DOMContentLoaded', () => {
  const tempMobile = localStorage.getItem('dvm_temp_mobile') || '9876543210';
  const maskedMobileEl = document.getElementById('maskedMobile');
  if (maskedMobileEl) {
    const last4 = tempMobile.slice(-4);
    maskedMobileEl.textContent = `+91 ******${last4}`;
  }

  const otpInputs = document.querySelectorAll('.otp-box');
  const otpForm = document.getElementById('otpForm');
  const otpError = document.getElementById('otpError');
  const otpSuccess = document.getElementById('otpSuccess');
  const timerCountEl = document.getElementById('timerCount');
  const resendBtn = document.getElementById('resendBtn');
  const verifyBtn = document.getElementById('verifyBtn');

  // Focus first input automatically
  if (otpInputs.length > 0) {
    setTimeout(() => otpInputs[0].focus(), 150);
  }

  // Handle Box Navigation
  otpInputs.forEach((input, index) => {
    // Only accept numeric inputs
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val ? val[0] : '';

      if (e.target.value) {
        input.classList.add('is-filled');
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        } else {
          // All 6 boxes filled -> auto verify
          checkAndSubmitOTP();
        }
      } else {
        input.classList.remove('is-filled');
      }
      if (otpError) otpError.style.display = 'none';
    });

    // Handle backspace navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!input.value && index > 0) {
          otpInputs[index - 1].focus();
          otpInputs[index - 1].value = '';
          otpInputs[index - 1].classList.remove('is-filled');
        }
      }
    });

    // Handle paste event (e.g. user copies 123456)
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      if (pastedData.length > 0) {
        pastedData.split('').forEach((char, i) => {
          if (otpInputs[i]) {
            otpInputs[i].value = char;
            otpInputs[i].classList.add('is-filled');
          }
        });
        const nextIndex = Math.min(pastedData.length, otpInputs.length - 1);
        otpInputs[nextIndex].focus();
        if (pastedData.length === 6) {
          checkAndSubmitOTP();
        }
      }
    });
  });

  // Verify function
  function checkAndSubmitOTP() {
    let enteredCode = '';
    otpInputs.forEach(input => {
      enteredCode += input.value;
    });

    if (enteredCode.length !== 6) {
      if (otpError) {
        otpError.textContent = "Please enter all 6 digits.";
        otpError.style.display = 'block';
      }
      return;
    }

    // Demo OTP validation
    if (enteredCode === '123456') {
      if (otpError) otpError.style.display = 'none';
      if (otpSuccess) otpSuccess.style.display = 'flex';
      
      // Update button state
      if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i> Verification successful!';
      }

      // Establish session
      DVM.login(tempMobile);

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      if (otpError) {
        otpError.textContent = "Invalid OTP. Please try again.";
        otpError.style.display = 'block';
      }
      // Shake effect
      const container = document.querySelector('.otp-container');
      if (container) {
        container.style.animation = 'none';
        container.offsetHeight; // trigger reflow
        container.style.animation = 'shake 0.4s ease';
      }
      // Highlight boxes red briefly
      otpInputs.forEach(inp => inp.style.borderColor = '#ef4444');
      setTimeout(() => {
        otpInputs.forEach(inp => inp.style.borderColor = '');
      }, 1000);
    }
  }

  // Form submit button
  if (otpForm) {
    otpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      checkAndSubmitOTP();
    });
  }

  // 30-Second Resend Countdown Timer
  let timeLeft = 30;
  let timerInterval = setInterval(() => {
    timeLeft--;
    if (timerCountEl) {
      timerCountEl.textContent = timeLeft;
    }
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const timerWrapper = document.getElementById('timerWrapper');
      if (timerWrapper) timerWrapper.style.display = 'none';
      if (resendBtn) {
        resendBtn.style.display = 'inline-block';
      }
    }
  }, 1000);

  // Resend OTP Action
  if (resendBtn) {
    resendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      DVM.showToast('OTP Resent', 'A new demo OTP (123456) has been dispatched.', 'info');
      resendBtn.style.display = 'none';
      const timerWrapper = document.getElementById('timerWrapper');
      if (timerWrapper) timerWrapper.style.display = 'block';
      timeLeft = 30;
      if (timerCountEl) timerCountEl.textContent = timeLeft;
      timerInterval = setInterval(() => {
        timeLeft--;
        if (timerCountEl) timerCountEl.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          if (timerWrapper) timerWrapper.style.display = 'none';
          resendBtn.style.display = 'inline-block';
        }
      }, 1000);
    });
  }
});
