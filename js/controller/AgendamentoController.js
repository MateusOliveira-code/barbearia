(function (global) {
  'use strict';

  class AgendamentoController {
    constructor(service) {
      this.service = service;
    }

    confirmar(dados) {
      try {
        const resultado = this.service.confirmar(dados);
        return {
          ok: true,
          message: 'Agendamento confirmado com sucesso.',
          ...resultado
        };
      } catch (error) {
        if (error && error.name === 'AgendamentoError') {
          return {
            ok: false,
            code: error.code,
            message: error.message
          };
        }
        throw error;
      }
    }
  }

  global.BarbeariaRafa = global.BarbeariaRafa || {};
  global.BarbeariaRafa.AgendamentoController = AgendamentoController;
})(window);
