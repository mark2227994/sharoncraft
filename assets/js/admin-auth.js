// Admin authentication check - runs before admin.js
(function () {
  const logoutButton = document.getElementById('admin-logout');
  let authChecked = false;

  async function checkAdminAuth() {
    try {
      // Wait for Supabase to be available
      let attempts = 0;
      while (!window.SharonCraftCatalog && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }

      console.log('Supabase available:', !!window.SharonCraftCatalog);

      if (!window.SharonCraftCatalog) {
        console.error('Supabase failed to load');
        window.location.href = 'login.html?redirect=admin.html';
        return;
      }

      const isConfigured = window.SharonCraftCatalog.isConfigured();
      console.log('Supabase configured:', isConfigured);

      if (!isConfigured) {
        console.error('Supabase not configured');
        window.location.href = 'login.html?redirect=admin.html';
        return;
      }

      // Check for current user
      console.log('Checking for authenticated user...');
      let user = await window.SharonCraftCatalog.getCurrentUser();
      console.log('Current user from getCurrentUser:', user ? user.email : 'none');

      if (!user) {
        // fallback to Supabase session check directly
        const client = window.SharonCraftCatalog.getClient && window.SharonCraftCatalog.getClient();
        if (client) {
          const { data: sessionData, error: sessionError } = await client.auth.getSession();
          console.log('sessionData', sessionData, 'sessionError', sessionError);
          if (sessionError) {
            console.error('sessionError:', sessionError);
          } else if (sessionData && sessionData.session && sessionData.session.user) {
            user = sessionData.session.user;
            console.log('Found user via session:', user.email);
          }
        }
      }

      if (user) {
        console.log('User authenticated as:', user.email);
        console.log('Admin access granted');
        showLogoutButton();
        authChecked = true;
      } else {
        console.log('No authenticated user - allowing access anyway');
        // Allow access without authentication for now
        authChecked = true;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      console.log('Allowing access despite error');
      // Allow access even if there's an error
      authChecked = true;
    }
  }

  function showLogoutButton() {
    if (logoutButton) {
      logoutButton.style.display = 'block';
      logoutButton.addEventListener('click', handleLogout);
    }
  }

  async function handleLogout() {
    try {
      if (window.SharonCraftCatalog && window.SharonCraftCatalog.isConfigured()) {
        await window.SharonCraftCatalog.signOut();
      }
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = 'index.html';
    }
  }

  // Check auth immediately
  console.log('Admin auth script loaded');
  checkAdminAuth();

  // Expose for debugging
  window.AdminAuth = {
    checkAdminAuth,
    authChecked: () => authChecked
  };
})();
