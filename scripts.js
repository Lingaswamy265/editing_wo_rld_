// frontend interactions, auth modal and download handling
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const authModal = document.getElementById('authModal');
  const closeModal = document.querySelector('.closeModal');
  const authForm = document.getElementById('authForm');
  const modalTitle = document.getElementById('modalTitle');
  const switchToSignup = document.getElementById('switchToSignup');
  const authMsg = document.getElementById('authMsg');

  let signupMode = false;

  loginBtn.addEventListener('click', () => {
    signupMode = false;
    modalTitle.textContent = 'Log in';
    authMsg.textContent = '';
    authModal.classList.remove('hidden');
  });

  closeModal.addEventListener('click', () => authModal.classList.add('hidden'));
  switchToSignup.addEventListener('click', () => {
    signupMode = true;
    modalTitle.textContent = 'Sign up';
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMsg.textContent = 'Please wait...';
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const url = signupMode ? '/api/signup' : '/api/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username, password})
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Auth failed');
      authMsg.style.color = 'lightgreen';
      authMsg.textContent = j.message || 'Success';
      updateAuthButtons(); // refresh state
      setTimeout(()=> authModal.classList.add('hidden'), 700);
    } catch (err) {
      authMsg.style.color = '#ffd5d5';
      authMsg.textContent = err.message;
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', {method:'POST'});
    updateAuthButtons();
  });

  async function updateAuthButtons(){
    const r = await fetch('/api/me');
    if (r.ok){
      const j = await r.json();
      loginBtn.hidden = true;
      logoutBtn.hidden = false;
      loginBtn.textContent = `Hi ${j.username}`;
    } else {
      loginBtn.hidden = false;
      logoutBtn.hidden = true;
    }
  }
  updateAuthButtons();

  // download buttons: create an <a> link and trigger click
  document.querySelectorAll('.downloadBtn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const src = btn.dataset.src;
      // Optionally request server to log the download or check auth
      const a = document.createElement('a');
      a.href = src;
      a.setAttribute('download', '');
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  });

  // play/pause on single click for each video for quick interactions
  document.querySelectorAll('video').forEach(v => {
    v.addEventListener('click', () => {
      if (v.paused) v.play();
      else v.pause();
    });
  });

});
