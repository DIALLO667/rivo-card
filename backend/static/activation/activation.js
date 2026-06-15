(function(){
  const tokenEl = document.getElementById('token');
  const path = window.location.pathname.split('/');
  const token = path[path.length-1];
  if (tokenEl) tokenEl.value = token;

  const previewPhoto = document.getElementById('previewPhoto');
  const previewInitial = document.getElementById('previewInitial');
  const previewName = document.getElementById('previewName');
  const previewJob = document.getElementById('previewJob');
  const previewCompany = document.getElementById('previewCompany');
  const previewPhone = document.getElementById('previewPhone');
  const previewLocation = document.getElementById('previewLocation');
  const previewLinkedin = document.getElementById('previewLinkedin');
  const previewInstagram = document.getElementById('previewInstagram');
  const previewTwitter = document.getElementById('previewTwitter');
  const previewFacebook = document.getElementById('previewFacebook');
  const previewSnapchat = document.getElementById('previewSnapchat');

  const nameInput = document.getElementById('name');
  const jobInput = document.getElementById('job');
  const companyInput = document.getElementById('company');
  const photoInput = document.getElementById('photo');
  const cropperContainer = document.getElementById('cropperContainer');
  const cropperImage = document.getElementById('cropperImage');
  const applyCropBtn = document.getElementById('applyCrop');
  const cancelCropBtn = document.getElementById('cancelCrop');
  let cropper = null;
  const linkedinInput = document.getElementById('linkedin');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const instagramInput = document.getElementById('instagram');
  const twitterInput = document.getElementById('twitter');
  const facebookInput = document.getElementById('facebook');
  const snapchatInput = document.getElementById('snapchat');
  const addressInput = document.getElementById('address');
  const addressSearchBtn = document.getElementById('addressSearch');
  const latInput = document.getElementById('lat');
  const lngInput = document.getElementById('lng');
  const useMyLocationBtn = document.getElementById('useMyLocation');
  const mapEl = document.getElementById('map');
  let map = null;
  let mapMarker = null;

  // initialize leaflet map if available
  function initMap(){
    if (!mapEl || typeof L === 'undefined') return;
    try{
      map = L.map(mapEl).setView([0,0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      map.on('click', async function(e){
        const {lat, lng} = e.latlng;
        if (mapMarker) map.removeLayer(mapMarker);
        mapMarker = L.marker([lat,lng]).addTo(map);
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
        // reverse geocode
        try{
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const j = await res.json();
          if (j && j.display_name) { if (addressInput) addressInput.value = j.display_name; updatePreview(); }
        }catch(e){ console.error('reverse geocode failed', e); }
      });
    }catch(e){ console.error('initMap error', e); }
  }

  if (useMyLocationBtn) useMyLocationBtn.addEventListener('click', function(){
    if (!navigator.geolocation) return alert('Géolocalisation non supportée');
    navigator.geolocation.getCurrentPosition(function(pos){
      const lat = pos.coords.latitude; const lng = pos.coords.longitude;
      if (map) map.setView([lat,lng], 14);
      if (mapMarker) map.removeLayer(mapMarker);
      mapMarker = L.marker([lat,lng]).addTo(map);
      if (latInput) latInput.value = lat; if (lngInput) lngInput.value = lng;
      // reverse geocode
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`).then(r => r.json()).then(j => { if (j && j.display_name) { if (addressInput) addressInput.value = j.display_name; updatePreview(); }}).catch(e=>console.error(e));
    }, function(err){ alert('Permission refusée ou erreur géolocalisation'); });
  });

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
    if (previewName && nameInput) previewName.textContent = (nameInput.value || 'Nom Prénom');
    if (previewJob && jobInput) previewJob.textContent = (jobInput.value || 'Titre / Poste');
    if (previewCompany && companyInput) previewCompany.textContent = (companyInput.value || '');
    if (previewPhone && phoneInput) previewPhone.textContent = phoneInput.value || '';
    if (previewLocation && addressInput) previewLocation.textContent = addressInput.value || '';
    // socials
    if (previewLinkedin && linkedinInput) { if (linkedinInput.value) { previewLinkedin.style.display='inline-flex'; previewLinkedin.href = linkedinInput.value; } else previewLinkedin.style.display='none'; }
    if (previewInstagram && instagramInput) { if (instagramInput.value) { previewInstagram.style.display='inline-flex'; previewInstagram.href = `https://instagram.com/${instagramInput.value.replace(/^@/, '')}`; } else previewInstagram.style.display='none'; }
    if (previewTwitter && twitterInput) { if (twitterInput.value) { previewTwitter.style.display='inline-flex'; previewTwitter.href = twitterInput.value.startsWith('http') ? twitterInput.value : `https://twitter.com/${twitterInput.value.replace(/^@/, '')}`; } else previewTwitter.style.display='none'; }
    if (previewFacebook && facebookInput) { if (facebookInput.value) { previewFacebook.style.display='inline-flex'; previewFacebook.href = facebookInput.value; } else previewFacebook.style.display='none'; }
    if (previewSnapchat && snapchatInput) { if (snapchatInput.value) { previewSnapchat.style.display='inline-flex'; previewSnapchat.href = `https://www.snapchat.com/add/${snapchatInput.value}`; } else previewSnapchat.style.display='none'; }
    if (photoInput && photoInput.files && photoInput.files[0]){
      const f = photoInput.files[0];
      const url = URL.createObjectURL(f);
      // initialize cropper for client-side circular crop
      if (cropperImage && cropperContainer) {
        cropperImage.src = url;
        try{ cropperContainer.style.display = 'block'; }catch(e){}
        if (cropper) try{ cropper.destroy(); }catch(e){}
        if (typeof Cropper !== 'undefined') {
          cropper = new Cropper(cropperImage, { aspectRatio:1, viewMode:1, dragMode:'move', autoCropArea:1, responsive:true });
        } else {
          // fallback: show the raw image in preview
          if (previewPhoto) { previewPhoto.src = url; previewPhoto.style.display='block'; }
        }
      } else {
        if (previewPhoto) { previewPhoto.src = url; previewPhoto.style.display='block'; }
      }
      if (previewInitial) previewInitial.style.display='none';
    } else {
      if (previewPhoto) { previewPhoto.src=''; previewPhoto.style.display='none'; }
      if (previewInitial) { previewInitial.style.display='block'; previewInitial.textContent = ((nameInput && nameInput.value) || 'U').charAt(0).toUpperCase(); }
    }
  }

  if (nameInput) nameInput.addEventListener('input', updatePreview);
  if (jobInput) jobInput.addEventListener('input', updatePreview);
  if (companyInput) companyInput.addEventListener('input', updatePreview);
  if (phoneInput) phoneInput.addEventListener('input', updatePreview);
  if (addressInput) addressInput.addEventListener('input', updatePreview);
  if (linkedinInput) linkedinInput.addEventListener('input', updatePreview);
  if (instagramInput) instagramInput.addEventListener('input', updatePreview);
  if (twitterInput) twitterInput.addEventListener('input', updatePreview);
  if (facebookInput) facebookInput.addEventListener('input', updatePreview);
  if (snapchatInput) snapchatInput.addEventListener('input', updatePreview);
  if (photoInput) photoInput.addEventListener('change', updatePreview);

  // Cropper actions
  if (applyCropBtn) applyCropBtn.addEventListener('click', async function(){
    if (!cropper || typeof Cropper === 'undefined') return;
    const canvas = cropper.getCroppedCanvas({ width: 400, height: 400, imageSmoothingQuality: 'high' });
    canvas.toBlob(function(blob){
      // set preview to cropped image
      const url = URL.createObjectURL(blob);
      if (previewPhoto) { previewPhoto.src = url; previewPhoto.style.display='block'; }
      if (previewInitial) previewInitial.style.display='none';
      // store blob in a temporary global to be appended on submit
      window.__rivo_cropped_blob = blob;
      // hide cropper
      if (cropper) { try{ cropper.destroy(); }catch(e){} cropper = null; }
      if (cropperContainer) try{ cropperContainer.style.display='none'; }catch(e){}
    }, 'image/webp', 0.9);
  });

  if (cancelCropBtn) cancelCropBtn.addEventListener('click', function(){
    if (cropper) { try{ cropper.destroy(); }catch(e){} cropper = null; }
    if (cropperContainer) cropperContainer.style.display='none';
    if (photoInput) photoInput.value = '';
    updatePreview();
  });

  // address search via Nominatim
  if (addressSearchBtn) addressSearchBtn.addEventListener('click', async function(){
    const q = (addressInput && addressInput.value) || '';
    if (!q) return alert('Entrez une adresse à rechercher');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const j = await res.json();
      if (j && j[0]){
        if (latInput) latInput.value = j[0].lat;
        if (lngInput) lngInput.value = j[0].lon;
        if (addressInput) addressInput.value = j[0].display_name;
        updatePreview();
        alert('Adresse trouvée');
      } else {
        alert('Adresse introuvable');
      }
    } catch (e) { console.error(e); alert('Erreur géocodage'); }
  });

  const formEl = document.getElementById('activationForm');
  if (formEl) formEl.addEventListener('submit', async function(e){
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    // if a cropped blob exists, append it as 'photo' (overrides original file)
    if (window.__rivo_cropped_blob) {
      fd.set('photo', window.__rivo_cropped_blob, 'photo.webp');
    }
    // append other fields
    fd.set('token', token);
  const msg = document.getElementById('formMsg');
  if (msg) msg.textContent = 'Envoi en cours...';
    try{
      const res = await fetch('/api/activation/submit', {method:'POST', body: fd});
      const j = await res.json();
      if(res.ok){
        if (msg) msg.textContent = 'Profil créé — fermeture automatique en cours...';
        // broadcast to other tabs (dashboard) that a new profile was created
        try { localStorage.setItem('rivo_last_created_profile', JSON.stringify({ profile_id: j.profile_id, ts: Date.now() })); } catch (e) {}
        // show a small success overlay
        try {
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed'; overlay.style.left = 0; overlay.style.top = 0; overlay.style.right = 0; overlay.style.bottom = 0; overlay.style.background = 'rgba(0,0,0,0.4)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex=9999;
          const box = document.createElement('div'); box.style.background='#fff'; box.style.padding='20px'; box.style.borderRadius='12px'; box.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)'; box.innerText = 'Profil créé avec succès — cette fenêtre va se fermer.';
          overlay.appendChild(box); document.body.appendChild(overlay);
        } catch (e) {}
        // reset form and close after a short delay
        form.reset(); updatePreview();
        setTimeout(() => { try { window.close(); } catch(e) { /* ignore */ } }, 1400);
      } else {
        if (msg) msg.textContent = j.detail || 'Erreur lors de la création du profil';
      }
    }catch(err){
      console.error(err);
      if (msg) msg.textContent = 'Erreur réseau lors de la soumission';
    }
  });

  checkToken();
  updatePreview();
  // init map (if leaflet loaded)
  try{ initMap(); }catch(e){}
})();
