(function (global) {
  'use strict';

  class AgendamentoRepository {
    constructor(getState, persist) {
      this.getState = getState;
      this.persist = persist;
    }

    horarioOcupado(barberId, date, time) {
      return this.getState().bookings.some(booking =>
        booking.barberId === barberId &&
        booking.date === date &&
        booking.time === time &&
        booking.status === 'confirmado'
      );
    }

    buscarClientePorTelefone(phoneNormalizado) {
      return this.getState().users.find(user =>
        user.role === 'cliente' &&
        String(user.phone || '').replace(/\D/g, '') === phoneNormalizado
      ) || null;
    }

    salvarCliente(cliente) {
      const state = this.getState();
      const index = state.users.findIndex(user => user.id === cliente.id);

      if (index >= 0) {
        state.users[index] = { ...state.users[index], ...cliente };
      } else {
        state.users.push(cliente);
      }

      this.persist();
      return cliente;
    }

    salvarAgendamento(agendamento) {
      this.getState().bookings.push(agendamento);
      this.persist();
      return agendamento;
    }

    barbeiroAtivo(barberId) {
      return this.getState().users.some(user =>
        user.id === barberId && user.role === 'barbeiro' && user.active
      );
    }

    servicosAtivos(serviceIds) {
      const ativos = new Set(
        this.getState().services
          .filter(service => service.active)
          .map(service => service.id)
      );
      return serviceIds.every(id => ativos.has(id));
    }
  }

  global.BarbeariaRafa = global.BarbeariaRafa || {};
  global.BarbeariaRafa.AgendamentoRepository = AgendamentoRepository;
})(window);
