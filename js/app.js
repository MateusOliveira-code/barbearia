(function () {
  'use strict';

  const STORAGE_KEY = 'barbearia-do-rafa-state-v1';
  const CLIENT_KEY = 'barbearia-do-rafa-client-v1';
  const TIMES = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const localISO = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const dateBR = (iso) => {
    if (!iso) return '—';
    const [y,m,d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d));
  };

  const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  const initials = (name = '') => name.trim().split(/\s+/).slice(0,2).map(p => p[0] || '').join('').toUpperCase() || '?';
  const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : clone(window.BARBEARIA_RAFA_DEMO_DATA);
    } catch (_) {
      return clone(window.BARBEARIA_RAFA_DEMO_DATA);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadClientProfile() {
    try { return JSON.parse(localStorage.getItem(CLIENT_KEY)) || null; } catch (_) { return null; }
  }

  function saveClientProfile(profile) {
    localStorage.setItem(CLIENT_KEY, JSON.stringify(profile));
  }

  let state = loadState();
  let clientProfile = loadClientProfile();
  let selectedServices = [];
  let selectedBarber = null;
  let selectedDate = localISO();
  let selectedTime = null;
  let currentRole = 'cliente';
  let activeBarberId = null;
  let modalContext = null;
  let toastTimer = null;

  const roleCopy = {
    cliente: ['Barbearia do Rafa','Seu corte. Seu horário.','Escolha o serviço, o profissional e um horário livre sem precisar ligar.'],
    barbeiro: ['Barbearia do Rafa — equipe','Agenda do dia','Visualize seus atendimentos, conclua o serviço e registre o valor final.'],
    admin: ['Barbearia do Rafa — administração','Cadastros e serviços','Mantenha barbeiros, clientes, serviços e preços atualizados.']
  };

  function boot() {
    const dateInput = $('#booking-date');
    dateInput.min = localISO();
    dateInput.value = selectedDate;

    if (clientProfile) {
      $('#client-name').value = clientProfile.name || '';
      $('#client-phone').value = clientProfile.phone || '';
    }

    activeBarberId = activeBarbers()[0]?.id || null;
    bindEvents();
    renderAll();
  }

  function bindEvents() {
    $$('.role-button').forEach(button => button.addEventListener('click', () => switchRole(button.dataset.role)));
    $('#booking-date').addEventListener('change', (event) => {
      selectedDate = event.target.value;
      selectedTime = null;
      renderTimes();
      renderSummary();
    });
    $('#confirm-booking').addEventListener('click', confirmBooking);
    $('#client-name').addEventListener('input', renderClientBookings);
    $('#client-phone').addEventListener('input', renderClientBookings);
    $('#barber-selector').addEventListener('change', (event) => { activeBarberId = event.target.value; renderBarberArea(); });
    $('#reset-demo').addEventListener('click', resetDemo);
    $('#new-user').addEventListener('click', () => openUserModal());
    $('#new-service').addEventListener('click', () => openServiceModal());

    $$('.admin-tab').forEach(tab => tab.addEventListener('click', () => switchAdminTab(tab.dataset.adminTab)));

    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-cancel').addEventListener('click', closeModal);
    $('#modal-save').addEventListener('click', saveModal);
    $('#modal-backdrop').addEventListener('click', (event) => { if (event.target.id === 'modal-backdrop') closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#modal-backdrop').hidden) closeModal(); });
  }

  function switchRole(role) {
    currentRole = role;
    $$('.role-button').forEach(button => button.classList.toggle('active', button.dataset.role === role));
    $$('.view').forEach(view => view.classList.toggle('active', view.id === `${role}-view`));
    const [eyebrow, title, subtitle] = roleCopy[role];
    $('#screen-eyebrow').textContent = eyebrow;
    $('#screen-title').textContent = title;
    $('#screen-subtitle').textContent = subtitle;
    if (role === 'barbeiro') renderBarberArea();
    if (role === 'admin') renderAdmin();
  }

  function renderAll() {
    renderClientArea();
    renderBarberSelector();
    renderBarberArea();
    renderAdmin();
  }

  function activeServices() { return state.services.filter(service => service.active); }
  function activeBarbers() { return state.users.filter(user => user.role === 'barbeiro' && user.active); }
  function userById(id) { return state.users.find(user => user.id === id); }
  function serviceById(id) { return state.services.find(service => service.id === id); }
  function serviceTotal(ids) { return ids.reduce((sum, id) => sum + Number(serviceById(id)?.price || 0), 0); }
  function serviceNames(ids) { return ids.map(id => serviceById(id)?.name || 'Serviço removido'); }

  function renderClientArea() {
    renderServices();
    renderBarbers();
    renderTimes();
    renderSummary();
    renderClientBookings();
  }

  function renderServices() {
    const services = activeServices();
    const grid = $('#services-grid');
    if (!services.length) {
      grid.innerHTML = '<div class="empty-state"><strong>Nenhum serviço ativo</strong>O administrador pode cadastrar novos serviços.</div>';
      return;
    }
    selectedServices = selectedServices.filter(id => services.some(service => service.id === id));
    grid.innerHTML = services.map(service => `
      <button class="service-card ${selectedServices.includes(service.id) ? 'selected' : ''}" type="button" data-service-id="${service.id}">
        <div class="service-top"><span class="eyebrow">${service.duration} min</span><span class="checkmark">✓</span></div>
        <h3>${escapeHTML(service.name)}</h3>
        <p>${escapeHTML(service.description || 'Serviço da barbearia.')}</p>
        <div class="meta"><span>Duração estimada</span><span class="price">${money(service.price)}</span></div>
      </button>`).join('');

    $$('.service-card', grid).forEach(card => card.addEventListener('click', () => {
      const id = card.dataset.serviceId;
      selectedServices = selectedServices.includes(id) ? selectedServices.filter(item => item !== id) : [...selectedServices, id];
      renderServices();
      renderSummary();
    }));
    $('#service-count').textContent = `${selectedServices.length} selecionado${selectedServices.length === 1 ? '' : 's'}`;
  }

  function renderBarbers() {
    const barbers = activeBarbers();
    const grid = $('#barbers-grid');
    if (!barbers.length) {
      selectedBarber = null;
      grid.innerHTML = '<div class="empty-state"><strong>Nenhum barbeiro ativo</strong>Ative ou cadastre um profissional na área administrativa.</div>';
      renderTimes();
      return;
    }
    if (selectedBarber && !barbers.some(barber => barber.id === selectedBarber)) selectedBarber = null;
    grid.innerHTML = barbers.map(barber => `
      <button class="barber-card ${selectedBarber === barber.id ? 'selected' : ''}" type="button" data-barber-id="${barber.id}">
        <span class="avatar">${initials(barber.name)}</span>
        <span><strong>${escapeHTML(barber.name)}</strong><small>${escapeHTML(barber.specialty || 'Profissional da equipe')}</small></span>
      </button>`).join('');
    $$('.barber-card', grid).forEach(card => card.addEventListener('click', () => {
      selectedBarber = card.dataset.barberId;
      selectedTime = null;
      renderBarbers();
      renderTimes();
      renderSummary();
    }));
  }

  function renderTimes() {
    const grid = $('#times-grid');
    if (!selectedBarber) {
      grid.innerHTML = '<span class="helper-text">Selecione um profissional para ver os horários.</span>';
      return;
    }
    const occupied = new Set(state.bookings
      .filter(booking => booking.barberId === selectedBarber && booking.date === selectedDate && booking.status === 'confirmado')
      .map(booking => booking.time));

    grid.innerHTML = TIMES.map(time => `<button type="button" class="time-button ${selectedTime === time ? 'selected' : ''}" data-time="${time}" ${occupied.has(time) ? 'disabled title="Horário ocupado"' : ''}>${time}</button>`).join('');
    $$('.time-button:not(:disabled)', grid).forEach(button => button.addEventListener('click', () => {
      selectedTime = button.dataset.time;
      renderTimes();
      renderSummary();
    }));
  }

  function renderSummary() {
    const serviceContainer = $('#summary-services');
    if (!selectedServices.length) {
      serviceContainer.className = 'summary-lines muted';
      serviceContainer.textContent = 'Nenhum serviço selecionado';
    } else {
      serviceContainer.className = 'summary-lines';
      serviceContainer.innerHTML = selectedServices.map(id => {
        const service = serviceById(id);
        return `<div class="summary-line"><span>${escapeHTML(service?.name || 'Serviço')}</span><strong>${money(service?.price || 0)}</strong></div>`;
      }).join('');
    }
    $('#summary-barber').textContent = userById(selectedBarber)?.name || '—';
    $('#summary-date').textContent = selectedDate ? dateBR(selectedDate) : '—';
    $('#summary-time').textContent = selectedTime || '—';
    $('#summary-total').textContent = money(serviceTotal(selectedServices));
  }

  function confirmBooking() {
    const name = $('#client-name').value.trim();
    const phone = $('#client-phone').value.trim();
    if (!selectedServices.length) return toast('Selecione pelo menos um serviço.');
    if (!selectedBarber) return toast('Selecione um profissional.');
    if (!selectedDate || !selectedTime) return toast('Escolha uma data e um horário disponíveis.');
    if (name.length < 2 || phone.length < 8) return toast('Informe seu nome e telefone para confirmar.');

    const stillOccupied = state.bookings.some(booking => booking.barberId === selectedBarber && booking.date === selectedDate && booking.time === selectedTime && booking.status === 'confirmado');
    if (stillOccupied) {
      selectedTime = null;
      renderTimes();
      renderSummary();
      return toast('Esse horário acabou de ficar indisponível. Escolha outro.');
    }

    let client = state.users.find(user => user.role === 'cliente' && normalizePhone(user.phone) === normalizePhone(phone));
    if (!client) {
      client = { id: uid('usr-c'), name, role: 'cliente', phone, active: true };
      state.users.push(client);
    } else {
      client.name = name;
      client.phone = phone;
      client.active = true;
    }

    const booking = {
      id: uid('ag'), clientId: client.id, clientName: name, clientPhone: phone,
      barberId: selectedBarber, serviceIds: [...selectedServices], date: selectedDate, time: selectedTime,
      status: 'confirmado', finalValue: null, createdAt: new Date().toISOString()
    };
    state.bookings.push(booking);
    clientProfile = { id: client.id, name, phone };
    saveClientProfile(clientProfile);
    saveState();

    selectedServices = [];
    selectedBarber = null;
    selectedTime = null;
    renderAll();
    toast('Agendamento confirmado com sucesso.');
  }

  function normalizePhone(phone = '') { return phone.replace(/\D/g, ''); }

  function renderClientBookings() {
    const list = $('#client-bookings');
    const name = $('#client-name').value.trim();
    const phone = normalizePhone($('#client-phone').value);
    const today = localISO();
    if (!name && !phone) {
      list.innerHTML = '<div class="empty-state"><strong>Seus agendamentos aparecerão aqui</strong>Informe seus dados e confirme um horário para começar.</div>';
      return;
    }
    const bookings = state.bookings
      .filter(booking => booking.status === 'confirmado' && booking.date >= today && ((phone && normalizePhone(booking.clientPhone) === phone) || (!phone && booking.clientName.toLowerCase() === name.toLowerCase())))
      .sort((a,b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    if (!bookings.length) {
      list.innerHTML = '<div class="empty-state"><strong>Nenhum agendamento futuro</strong>Seus próximos horários confirmados serão exibidos aqui.</div>';
      return;
    }

    list.innerHTML = bookings.map(booking => `
      <article class="booking-item">
        <div class="main">
          <h3>${dateBR(booking.date)} às ${booking.time} · ${escapeHTML(userById(booking.barberId)?.name || 'Profissional')}</h3>
          <p>${escapeHTML(serviceNames(booking.serviceIds).join(' + '))} · ${money(serviceTotal(booking.serviceIds))}</p>
        </div>
        <div class="meta-side">
          <span class="badge confirmed">Confirmado</span>
          <button class="danger-button cancel-booking" type="button" data-booking-id="${booking.id}">Cancelar</button>
        </div>
      </article>`).join('');

    $$('.cancel-booking', list).forEach(button => button.addEventListener('click', () => cancelBooking(button.dataset.bookingId)));
  }

  function cancelBooking(id) {
    const booking = state.bookings.find(item => item.id === id);
    if (!booking) return;
    if (!confirm('Deseja cancelar este agendamento? O horário ficará disponível novamente.')) return;
    booking.status = 'cancelado';
    saveState();
    renderAll();
    toast('Agendamento cancelado.');
  }

  function renderBarberSelector() {
    const selector = $('#barber-selector');
    const barbers = activeBarbers();
    if (activeBarberId && !barbers.some(b => b.id === activeBarberId)) activeBarberId = barbers[0]?.id || null;
    selector.innerHTML = barbers.length ? barbers.map(barber => `<option value="${barber.id}" ${barber.id === activeBarberId ? 'selected' : ''}>${escapeHTML(barber.name)}</option>`).join('') : '<option value="">Nenhum barbeiro ativo</option>';
    selector.disabled = !barbers.length;
  }

  function renderBarberArea() {
    renderBarberSelector();
    const list = $('#barber-bookings');
    const today = localISO();
    $('#today-label').textContent = dateBR(today);
    const barber = userById(activeBarberId);
    $('#barber-agenda-title').textContent = barber ? `Atendimentos de ${barber.name.split(' ')[0]}` : 'Atendimentos';
    const bookings = state.bookings.filter(booking => booking.barberId === activeBarberId && booking.date === today && booking.status !== 'cancelado').sort((a,b) => a.time.localeCompare(b.time));
    const completed = bookings.filter(booking => booking.status === 'concluido');
    const pending = bookings.filter(booking => booking.status === 'confirmado');
    const revenue = completed.reduce((sum, booking) => sum + Number(booking.finalValue ?? serviceTotal(booking.serviceIds)), 0);
    $('#stat-today').textContent = bookings.length;
    $('#stat-completed').textContent = completed.length;
    $('#stat-pending').textContent = pending.length;
    $('#stat-revenue').textContent = money(revenue);

    if (!activeBarberId) {
      list.innerHTML = '<div class="empty-state"><strong>Nenhum barbeiro ativo</strong>Cadastre ou ative um profissional na área administrativa.</div>';
      return;
    }
    if (!bookings.length) {
      list.innerHTML = '<div class="empty-state"><strong>Agenda livre hoje</strong>Não há atendimentos marcados para este profissional.</div>';
      return;
    }

    list.innerHTML = bookings.map(booking => {
      const total = booking.status === 'concluido' ? booking.finalValue : serviceTotal(booking.serviceIds);
      return `<article class="agenda-item ${booking.status === 'concluido' ? 'completed' : ''}">
        <div class="agenda-time">${booking.time}</div>
        <div class="main">
          <h3>${escapeHTML(booking.clientName)}</h3>
          <p>${escapeHTML(serviceNames(booking.serviceIds).join(' + '))} · ${escapeHTML(booking.clientPhone || 'Sem telefone')}</p>
        </div>
        <div class="meta-side">
          <strong>${money(total)}</strong>
          <span class="badge ${booking.status === 'concluido' ? 'completed' : 'confirmed'}">${booking.status === 'concluido' ? 'Concluído' : 'Confirmado'}</span>
          ${booking.status === 'confirmado' ? `<button class="primary-button complete-booking" type="button" data-booking-id="${booking.id}">Concluir</button>` : ''}
        </div>
      </article>`;
    }).join('');
    $$('.complete-booking', list).forEach(button => button.addEventListener('click', () => openCompleteModal(button.dataset.bookingId)));
  }

  function openCompleteModal(bookingId) {
    const booking = state.bookings.find(item => item.id === bookingId);
    if (!booking) return;
    modalContext = { type: 'complete', id: bookingId };
    $('#modal-eyebrow').textContent = 'Finalizar atendimento';
    $('#modal-title').textContent = booking.clientName;
    $('#modal-body').innerHTML = `
      <div class="summary-block">
        <span>Serviços realizados</span>
        <div class="summary-lines">${booking.serviceIds.map(id => `<div class="summary-line"><span>${escapeHTML(serviceById(id)?.name || 'Serviço')}</span><strong>${money(serviceById(id)?.price || 0)}</strong></div>`).join('')}</div>
      </div>
      <label class="field"><span>Valor final cobrado</span><input id="complete-value" type="number" min="0" step="0.01" value="${serviceTotal(booking.serviceIds).toFixed(2)}" /></label>
      <p class="helper-text">Ao concluir, o atendimento entra no resumo do dia e o horário deixa de ficar bloqueado na agenda.</p>`;
    $('#modal-save').textContent = 'Concluir atendimento';
    openModal();
  }

  function switchAdminTab(tab) {
    $$('.admin-tab').forEach(button => button.classList.toggle('active', button.dataset.adminTab === tab));
    $$('.admin-panel').forEach(panel => panel.classList.toggle('active', panel.id === `admin-${tab}`));
  }

  function renderAdmin() {
    renderUsersTable();
    renderServicesTable();
  }

  function renderUsersTable() {
    const body = $('#users-table-body');
    const users = [...state.users].sort((a,b) => (a.role + a.name).localeCompare(b.role + b.name));
    body.innerHTML = users.map(user => `
      <tr>
        <td><div class="user-cell"><span class="avatar">${initials(user.name)}</span><strong>${escapeHTML(user.name)}</strong></div></td>
        <td>${user.role === 'barbeiro' ? 'Barbeiro' : 'Cliente'}</td>
        <td>${escapeHTML(user.phone || '—')}</td>
        <td><span class="badge ${user.active ? 'active' : 'inactive'}">${user.active ? 'Ativo' : 'Inativo'}</span></td>
        <td class="actions-col"><div class="table-actions">
          <button class="table-button edit-user" type="button" data-id="${user.id}">Editar</button>
          <button class="table-button ${user.active ? 'warning' : ''} toggle-user" type="button" data-id="${user.id}">${user.active ? 'Inativar' : 'Ativar'}</button>
        </div></td>
      </tr>`).join('');
    $$('.edit-user', body).forEach(button => button.addEventListener('click', () => openUserModal(button.dataset.id)));
    $$('.toggle-user', body).forEach(button => button.addEventListener('click', () => toggleUser(button.dataset.id)));
  }

  function toggleUser(id) {
    const user = userById(id);
    if (!user) return;
    user.active = !user.active;
    saveState();
    if (user.role === 'barbeiro' && !user.active && selectedBarber === user.id) selectedBarber = null;
    renderAll();
    toast(`${user.name} foi ${user.active ? 'ativado' : 'inativado'}.`);
  }

  function openUserModal(id = null) {
    const user = id ? userById(id) : null;
    modalContext = { type: 'user', id };
    $('#modal-eyebrow').textContent = user ? 'Editar usuário' : 'Novo usuário';
    $('#modal-title').textContent = user ? user.name : 'Cadastrar usuário';
    $('#modal-body').innerHTML = `
      <div class="form-grid">
        <label class="field full-span"><span>Nome</span><input id="user-name" maxlength="80" value="${escapeHTML(user?.name || '')}" placeholder="Nome completo" /></label>
        <label class="field"><span>Perfil</span><select id="user-role"><option value="cliente" ${user?.role === 'cliente' ? 'selected' : ''}>Cliente</option><option value="barbeiro" ${user?.role === 'barbeiro' ? 'selected' : ''}>Barbeiro</option></select></label>
        <label class="field"><span>Telefone</span><input id="user-phone" maxlength="20" value="${escapeHTML(user?.phone || '')}" placeholder="(34) 99999-9999" /></label>
        <label class="field full-span"><span>Especialidade (barbeiro)</span><input id="user-specialty" maxlength="80" value="${escapeHTML(user?.specialty || '')}" placeholder="Ex.: barba e degradê" /></label>
      </div>`;
    $('#modal-save').textContent = user ? 'Salvar alterações' : 'Cadastrar';
    openModal();
  }

  function renderServicesTable() {
    const body = $('#services-table-body');
    body.innerHTML = state.services.map(service => `
      <tr>
        <td><div class="service-cell"><strong>${escapeHTML(service.name)}</strong></div></td>
        <td>${service.duration} min</td>
        <td>${money(service.price)}</td>
        <td><span class="badge ${service.active ? 'active' : 'inactive'}">${service.active ? 'Ativo' : 'Inativo'}</span></td>
        <td class="actions-col"><div class="table-actions">
          <button class="table-button edit-service" type="button" data-id="${service.id}">Editar</button>
          <button class="table-button ${service.active ? 'warning' : ''} toggle-service" type="button" data-id="${service.id}">${service.active ? 'Desativar' : 'Ativar'}</button>
          <button class="table-button danger delete-service" type="button" data-id="${service.id}">Remover</button>
        </div></td>
      </tr>`).join('');
    $$('.edit-service', body).forEach(button => button.addEventListener('click', () => openServiceModal(button.dataset.id)));
    $$('.toggle-service', body).forEach(button => button.addEventListener('click', () => toggleService(button.dataset.id)));
    $$('.delete-service', body).forEach(button => button.addEventListener('click', () => deleteService(button.dataset.id)));
  }

  function openServiceModal(id = null) {
    const service = id ? serviceById(id) : null;
    modalContext = { type: 'service', id };
    $('#modal-eyebrow').textContent = service ? 'Editar serviço' : 'Novo serviço';
    $('#modal-title').textContent = service ? service.name : 'Cadastrar serviço';
    $('#modal-body').innerHTML = `
      <div class="form-grid">
        <label class="field full-span"><span>Nome do serviço</span><input id="service-name" maxlength="80" value="${escapeHTML(service?.name || '')}" placeholder="Ex.: Corte masculino" /></label>
        <label class="field"><span>Preço</span><input id="service-price" type="number" min="0" step="0.01" value="${service?.price ?? ''}" placeholder="45,00" /></label>
        <label class="field"><span>Duração (min)</span><input id="service-duration" type="number" min="5" step="5" value="${service?.duration ?? 30}" /></label>
        <label class="field full-span"><span>Descrição</span><input id="service-description" maxlength="140" value="${escapeHTML(service?.description || '')}" placeholder="Descrição curta do serviço" /></label>
      </div>`;
    $('#modal-save').textContent = service ? 'Salvar alterações' : 'Cadastrar';
    openModal();
  }

  function toggleService(id) {
    const service = serviceById(id);
    if (!service) return;
    service.active = !service.active;
    saveState();
    selectedServices = selectedServices.filter(item => item !== id || service.active);
    renderAll();
    toast(`${service.name} foi ${service.active ? 'ativado' : 'desativado'}.`);
  }

  function deleteService(id) {
    const service = serviceById(id);
    if (!service) return;
    const used = state.bookings.some(booking => booking.serviceIds.includes(id));
    if (used) {
      service.active = false;
      saveState();
      renderAll();
      return toast('Esse serviço possui histórico. Ele foi desativado em vez de removido.');
    }
    if (!confirm(`Remover definitivamente o serviço “${service.name}”?`)) return;
    state.services = state.services.filter(item => item.id !== id);
    selectedServices = selectedServices.filter(item => item !== id);
    saveState();
    renderAll();
    toast('Serviço removido do catálogo.');
  }

  function openModal() {
    $('#modal-backdrop').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    $('#modal-backdrop').hidden = true;
    document.body.style.overflow = '';
    modalContext = null;
  }

  function saveModal() {
    if (!modalContext) return;
    if (modalContext.type === 'complete') return saveComplete();
    if (modalContext.type === 'user') return saveUser();
    if (modalContext.type === 'service') return saveService();
  }

  function saveComplete() {
    const booking = state.bookings.find(item => item.id === modalContext.id);
    const value = Number($('#complete-value').value);
    if (!booking || !Number.isFinite(value) || value < 0) return toast('Informe um valor final válido.');
    booking.status = 'concluido';
    booking.finalValue = value;
    booking.completedAt = new Date().toISOString();
    saveState();
    closeModal();
    renderAll();
    toast('Atendimento concluído e valor registrado.');
  }

  function saveUser() {
    const name = $('#user-name').value.trim();
    const role = $('#user-role').value;
    const phone = $('#user-phone').value.trim();
    const specialty = $('#user-specialty').value.trim();
    if (name.length < 2) return toast('Informe o nome do usuário.');
    if (!['cliente','barbeiro'].includes(role)) return toast('Selecione um perfil válido.');

    if (modalContext.id) {
      const user = userById(modalContext.id);
      if (!user) return;
      Object.assign(user, { name, role, phone, specialty: role === 'barbeiro' ? specialty : '' });
    } else {
      state.users.push({ id: uid(role === 'barbeiro' ? 'usr-b' : 'usr-c'), name, role, phone, specialty: role === 'barbeiro' ? specialty : '', active: true });
    }
    saveState();
    closeModal();
    renderAll();
    toast('Usuário salvo com sucesso.');
  }

  function saveService() {
    const name = $('#service-name').value.trim();
    const price = Number($('#service-price').value);
    const duration = Number($('#service-duration').value);
    const description = $('#service-description').value.trim();
    if (name.length < 2) return toast('Informe o nome do serviço.');
    if (!Number.isFinite(price) || price < 0) return toast('Informe um preço válido.');
    if (!Number.isFinite(duration) || duration < 5) return toast('Informe uma duração válida.');

    if (modalContext.id) {
      const service = serviceById(modalContext.id);
      if (!service) return;
      Object.assign(service, { name, price, duration, description });
    } else {
      state.services.push({ id: uid('srv'), name, price, duration, description, active: true });
    }
    saveState();
    closeModal();
    renderAll();
    toast('Serviço salvo com sucesso.');
  }

  function resetDemo() {
    if (!confirm('Restaurar todos os dados de demonstração? Agendamentos e alterações locais serão apagados.')) return;
    state = clone(window.BARBEARIA_RAFA_DEMO_DATA);
    clientProfile = null;
    selectedServices = [];
    selectedBarber = null;
    selectedTime = null;
    selectedDate = localISO();
    activeBarberId = activeBarbers()[0]?.id || null;
    localStorage.removeItem(CLIENT_KEY);
    saveState();
    $('#client-name').value = '';
    $('#client-phone').value = '';
    $('#booking-date').value = selectedDate;
    renderAll();
    toast('Dados de demonstração restaurados.');
  }

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 3200);
  }

  boot();
})();
