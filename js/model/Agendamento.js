(function (global) {
  'use strict';

  class Agendamento {
    constructor({ id, clientId, clientName, clientPhone, barberId, serviceIds, date, time, createdAt }) {
      this.id = id;
      this.clientId = clientId;
      this.clientName = clientName;
      this.clientPhone = clientPhone;
      this.barberId = barberId;
      this.serviceIds = [...serviceIds];
      this.date = date;
      this.time = time;
      this.status = 'confirmado';
      this.finalValue = null;
      this.createdAt = createdAt;
    }
  }

  global.BarbeariaRafa = global.BarbeariaRafa || {};
  global.BarbeariaRafa.Agendamento = Agendamento;
})(window);
