document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById('login-form');
  const statusDiv = document.getElementById('login-status');
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect') || 'admin.html';

  function setStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = `login-status ${isError ? 'error' : 'success'}`;
  }

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      setStatus('Please enter both email and password.', true);
      return;
    }

    setStatus('Logging in...');

    try {
      if (!window.SharonCraftCatalog || !window.SharonCraftCatalog.isConfigured()) {
        setStatus('Supabase is not configured. Please check your setup.', true);
        return;
      }

      const result = await window.SharonCraftCatalog.signInWithPassword(email, password);
      console.log('Supabase login result:', result);

      if (result && result.user) {
        setStatus('Login successful! Verifying session...');

        // Immediately verify session
        let currentUser = await window.SharonCraftCatalog.getCurrentUser();
        if (!currentUser) {
          const client = window.SharonCraftCatalog.getClient && window.SharonCraftCatalog.getClient();
          if (client) {
            const { data: sessionData, error: sessionError } = await client.auth.getSession();
            console.log('Session data after login:', sessionData, 'sessionError:', sessionError);
            if (sessionError) {
              console.error('Session error:', sessionError);
            } else if (sessionData && sessionData.session && sessionData.session.user) {
              currentUser = sessionData.session.user;
            }
          }
        }

        if (currentUser) {
          setStatus('Login successful! Redirecting to admin...');
          setTimeout(() => {
            window.location.href = redirect;
          }, 600);
        } else {
          setStatus('Login succeeded but session is not active. Please refresh or try again.', true);
        }
      } else {
        setStatus('Login failed: invalid email/password.', true);
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = (error && error.message) ? error.message : 'Unknown server error';
      setStatus(`Login failed: ${message}`, true);
    }
  });

  // Check if user is already logged in
  async function checkAuth() {
    try {
      if (window.SharonCraftCatalog && window.SharonCraftCatalog.isConfigured()) {
        const user = await window.SharonCraftCatalog.getCurrentUser();
        if (user) {
          setStatus('Already logged in. Redirecting...');
          setTimeout(() => {
            window.location.href = redirect;
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }

  checkAuth();
});</content>
<parameter name="filePath">c:\Users\USER\Desktop\projects\bead VN2\assets\js\login.js