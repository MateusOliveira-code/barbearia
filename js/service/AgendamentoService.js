(function (global) {
  'use strict';

  class AgendamentoError extends Error {
    constructor(code, message) {
      super(message);
      this.name = 'AgendamentoError';
      this.code = code;
    }
  }

  class AgendamentoService {
    constructor(repository, idFactory) {
      this.repository = repository;
      this.idFactory = idFactory;
    }

    confirmar({ serviceIds, barberId, date, time, name, phone }) {
      const nome = String(name || '').trim();
      const telefone = String(phone || '').trim();
      const servicos = Array.isArray(serviceIds) ? [...serviceIds] : [];

      if (!servicos.length) {
        throw new AgendamentoError('SERVICO_OBRIGATORIO', 'Selecione pelo menos um serviço.');
      }
      if (!this.repository.servicosAtivos(servicos)) {
        throw new AgendamentoError('SERVICO_INDISPONIVEL', 'Um dos serviços selecionados não está mais disponível.');
      }
      if (!barberId || !this.repository.barbeiroAtivo(barberId)) {
        throw new AgendamentoError('BARBEIRO_OBRIGATORIO', 'Selecione um profissional disponível.');
      }
      if (!date || !time) {
        throw new AgendamentoError('HORARIO_OBRIGATORIO', 'Escolha uma data e um horário disponíveis.');
      }
      if (nome.length < 2 || telefone.length < 8) {
        throw new AgendamentoError('DADOS_CLIENTE_INVALIDOS', 'Informe seu nome e telefone para confirmar.');
      }
      if (this.repository.horarioOcupado(barberId, date, time)) {
        throw new AgendamentoError('HORARIO_OCUPADO', 'Esse horário acabou de ficar indisponível. Escolha outro.');
      }

      const telefoneNormalizado = telefone.replace(/\D/g, '');
      let cliente = this.repository.buscarClientePorTelefone(telefoneNormalizado);

      if (!cliente) {
        cliente = {
          id: this.idFactory('usr-c'),
          name: nome,
          role: 'cliente',
          phone: telefone,
          active: true
        };
      } else {
        cliente = {
          ...cliente,
          name: nome,
          phone: telefone,
          active: true
        };
      }

      this.repository.salvarCliente(cliente);

      const Agendamento = global.BarbeariaRafa.Agendamento;
      const agendamento = new Agendamento({
        id: this.idFactory('ag'),
        clientId: cliente.id,
        clientName: nome,
        clientPhone: telefone,
        barberId,
        serviceIds: servicos,
        date,
        time,
        createdAt: new Date().toISOString()
      });

      this.repository.salvarAgendamento(agendamento);
      return { agendamento, cliente };
    }
  }

  global.BarbeariaRafa = global.BarbeariaRafa || {};
  global.BarbeariaRafa.AgendamentoError = AgendamentoError;
  global.BarbeariaRafa.AgendamentoService = AgendamentoService;
})(window);
