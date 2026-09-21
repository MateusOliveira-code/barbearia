(function () {
  const isoLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(today.getDate() + 2);

  window.BARBEARIA_RAFA_DEMO_DATA = {
    services: [
      { id: 'srv-corte', name: 'Corte masculino', description: 'Corte clássico ou moderno com acabamento.', price: 45, duration: 40, active: true },
      { id: 'srv-barba', name: 'Barba', description: 'Modelagem, toalha quente e acabamento.', price: 35, duration: 30, active: true },
      { id: 'srv-combo', name: 'Corte + barba', description: 'Combo completo para renovar o visual.', price: 70, duration: 70, active: true },
      { id: 'srv-sobrancelha', name: 'Sobrancelha', description: 'Alinhamento e acabamento masculino.', price: 20, duration: 15, active: true },
      { id: 'srv-pezinho', name: 'Acabamento', description: 'Pezinho, contornos e pequenos ajustes.', price: 18, duration: 15, active: true },
      { id: 'srv-hidratacao', name: 'Hidratação capilar', description: 'Tratamento rápido para maciez e brilho.', price: 30, duration: 25, active: true }
    ],
    users: [
      { id: 'usr-b1', name: 'Rafael Lima', role: 'barbeiro', phone: '(34) 98888-1020', active: true, specialty: 'Corte e acabamento' },
      { id: 'usr-b2', name: 'Carlos Mendes', role: 'barbeiro', phone: '(34) 98888-2040', active: true, specialty: 'Barba e degradê' },
      { id: 'usr-b3', name: 'Bruno Alves', role: 'barbeiro', phone: '(34) 98888-3060', active: true, specialty: 'Clássico e tesoura' },
      { id: 'usr-c1', name: 'Lucas Ferreira', role: 'cliente', phone: '(34) 99912-1100', active: true },
      { id: 'usr-c2', name: 'Marcos Souza', role: 'cliente', phone: '(34) 99922-2200', active: true },
      { id: 'usr-c3', name: 'Diego Rocha', role: 'cliente', phone: '(34) 99932-3300', active: false }
    ],
    bookings: [
      { id: 'ag-1001', clientId: 'usr-c1', clientName: 'Lucas Ferreira', clientPhone: '(34) 99912-1100', barberId: 'usr-b1', serviceIds: ['srv-corte'], date: isoLocal(today), time: '09:00', status: 'confirmado', finalValue: null, createdAt: new Date().toISOString() },
      { id: 'ag-1002', clientId: 'usr-c2', clientName: 'Marcos Souza', clientPhone: '(34) 99922-2200', barberId: 'usr-b1', serviceIds: ['srv-barba'], date: isoLocal(today), time: '10:30', status: 'confirmado', finalValue: null, createdAt: new Date().toISOString() },
      { id: 'ag-1003', clientId: 'usr-c2', clientName: 'Marcos Souza', clientPhone: '(34) 99922-2200', barberId: 'usr-b2', serviceIds: ['srv-combo'], date: isoLocal(today), time: '14:00', status: 'concluido', finalValue: 70, createdAt: new Date().toISOString() },
      { id: 'ag-1004', clientId: 'usr-c1', clientName: 'Lucas Ferreira', clientPhone: '(34) 99912-1100', barberId: 'usr-b2', serviceIds: ['srv-corte', 'srv-sobrancelha'], date: isoLocal(tomorrow), time: '11:00', status: 'confirmado', finalValue: null, createdAt: new Date().toISOString() },
      { id: 'ag-1005', clientId: 'usr-c1', clientName: 'Lucas Ferreira', clientPhone: '(34) 99912-1100', barberId: 'usr-b3', serviceIds: ['srv-barba'], date: isoLocal(afterTomorrow), time: '16:30', status: 'confirmado', finalValue: null, createdAt: new Date().toISOString() }
    ]
  };
})();
