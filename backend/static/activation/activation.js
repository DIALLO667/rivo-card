(function(){
  const tokenEl = document.getElementById('token');
  const path = window.location.pathname.split('/');
  const token = path[path.length-1];
  tokenEl.value = token;

  const previewPhoto = document.getElementById('previewPhoto');
  const previewInitial = document.getElementById('previewInitial');
  const previewName = document.getElementById('previewName');
  const previewJob = document.getElementById('previewJob');
  const previewCompany = document.getElementById('previewCompany');

  const nameInput = document.getElementById('name');
  const jobInput = document.getElementById('job');
  const companyInput = document.getElementById('company');
  const photoInput = document.getElementById('photo');
  const linkedinInput = document.getElementById('linkedin');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  async function checkToken(){
    try{
      const res = await fetch(`/api/activation_tokens/${token}/validate`);
      const j = await res.json();
      if(!j.valid){
        window.location.href = '/static/activation/invalid.html';
      }
    }catch(e){
      console.error(e);
      window.location.href = '/static/activation/invalid.html';
    }
  }

  function updatePreview(){
    previewName.textContent = nameInput.value || 'Nom Prénom';
    previewJob.textContent = jobInput.value || 'Titre / Poste';
    previewCompany.textContent = companyInput.value || '';
    if(photoInput.files && photoInput.files[0]){
      const f = photoInput.files[0];
      const url = URL.createObjectURL(f);
      previewPhoto.src = url; previewPhoto.style.display='block'; previewInitial.style.display='none';
    } else {
      previewPhoto.src=''; previewPhoto.style.display='none'; previewInitial.style.display='block'; previewInitial.textContent = (nameInput.value||'U').charAt(0).toUpperCase();
    }
  }

  nameInput.addEventListener('input', updatePreview);
  jobInput.addEventListener('input', updatePreview);
  companyInput && companyInput.addEventListener('input', updatePreview);
  photoInput.addEventListener('change', updatePreview);

  document.getElementById('activationForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    // append other fields
    fd.set('token', token);
    const msg = document.getElementById('formMsg');
    msg.textContent = 'Envoi en cours...';
    try{
      const res = await fetch('/api/activation/submit', {method:'POST', body: fd});
      const j = await res.json();
      if(res.ok){
        msg.textContent = 'Profil créé — vous pouvez fermer cette fenêtre.';
        form.reset(); updatePreview();
      } else {
        msg.textContent = j.detail || 'Erreur lors de la création du profil';
      }
    }catch(err){
      console.error(err);
      msg.textContent = 'Erreur réseau lors de la soumission';
    }
  });

  checkToken();
  updatePreview();
})();
