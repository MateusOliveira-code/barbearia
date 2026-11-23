const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const contexto = { window: {} };

for (const arquivo of [
  'js/model/Agendamento.js',
  'js/repository/AgendamentoRepository.js',
  'js/service/AgendamentoService.js'
]) {
  const codigo = fs.readFileSync(path.join(__dirname, '..', arquivo), 'utf8');
  vm.runInNewContext(codigo, contexto, { filename: arquivo });
}

const { AgendamentoService, AgendamentoRepository } = contexto.window.BarbeariaRafa;

function criarCenario(opcoes = {}) {
  const estado = {
    users: [
      { id: 'barbeiro-1', role: 'barbeiro', active: true },
      { id: 'barbeiro-2', role: 'barbeiro', active: true },
      { id: 'barbeiro-3', role: 'barbeiro', active: false },
      ...(opcoes.users || [])
    ],
    services: [
      { id: 'corte', active: true },
      { id: 'barba', active: true },
      { id: 'hidratacao', active: false }
    ],
    bookings: [...(opcoes.bookings || [])]
  };

  let persistencias = 0;
  let contador = 0;
  const repository = new AgendamentoRepository(
    () => estado,
    () => { persistencias += 1; }
  );
  const service = new AgendamentoService(repository, prefixo => `${prefixo}-${++contador}`);

  return { estado, service, persistencias: () => persistencias };
}

function dadosValidos(alteracoes = {}) {
  return {
    serviceIds: ['corte'],
    barberId: 'barbeiro-1',
    date: '2030-01-15',
    time: '09:00',
    name: 'Ana Silva',
    phone: '34999999999',
    ...alteracoes
  };
}

function verificarErro(acao, codigo) {
  assert.throws(acao, erro => erro.name === 'AgendamentoError' && erro.code === codigo);
}

test('deve confirmar agendamento e cadastrar novo cliente', () => {
  // Arrange
  const { service, estado, persistencias } = criarCenario();

  // Act
  const { agendamento, cliente } = service.confirmar(dadosValidos());

  // Assert
  assert.equal(cliente.id, 'usr-c-1');
  assert.equal(agendamento.id, 'ag-2');
  assert.equal(agendamento.clientId, cliente.id);
  assert.equal(agendamento.status, 'confirmado');
  assert.equal(agendamento.finalValue, null);
  assert.equal(estado.users.length, 4);
  assert.equal(estado.bookings.length, 1);
  assert.equal(persistencias(), 2);
});

test('deve reaproveitar cliente com o mesmo telefone', () => {
  // Arrange
  const clienteExistente = {
    id: 'cliente-1', name: 'Nome antigo', role: 'cliente',
    phone: '(34) 99999-9999', active: false
  };
  const { service, estado } = criarCenario({ users: [clienteExistente] });

  // Act
  const { cliente, agendamento } = service.confirmar(dadosValidos());

  // Assert
  assert.equal(cliente.id, 'cliente-1');
  assert.equal(cliente.name, 'Ana Silva');
  assert.equal(cliente.active, true);
  assert.equal(agendamento.clientId, 'cliente-1');
  assert.equal(estado.users.length, 4);
});

test('deve aceitar mais de um serviço ativo', () => {
  // Arrange
  const { service } = criarCenario();

  // Act
  const { agendamento } = service.confirmar(dadosValidos({ serviceIds: ['corte', 'barba'] }));

  // Assert
  assert.equal(agendamento.serviceIds.length, 2);
  assert.ok(agendamento.serviceIds.includes('corte'));
  assert.ok(agendamento.serviceIds.includes('barba'));
});

test('deve rejeitar agendamento sem serviço', () => {
  // Arrange
  const { service, estado } = criarCenario();

  // Act e Assert
  verificarErro(() => service.confirmar(dadosValidos({ serviceIds: [] })), 'SERVICO_OBRIGATORIO');
  assert.equal(estado.bookings.length, 0);
});

test('deve rejeitar serviço inativo', () => {
  // Arrange
  const { service, persistencias } = criarCenario();

  // Act e Assert
  verificarErro(() => service.confirmar(dadosValidos({ serviceIds: ['hidratacao'] })), 'SERVICO_INDISPONIVEL');
  assert.equal(persistencias(), 0);
});

test('deve rejeitar barbeiro inativo', () => {
  // Arrange
  const { service } = criarCenario();

  // Act e Assert
  verificarErro(() => service.confirmar(dadosValidos({ barberId: 'barbeiro-3' })), 'BARBEIRO_OBRIGATORIO');
});

test('deve rejeitar agendamento sem data', () => {
  // Arrange
  const { service } = criarCenario();

  // Act e Assert
  verificarErro(() => service.confirmar(dadosValidos({ date: '' })), 'HORARIO_OBRIGATORIO');
});

test('deve rejeitar agendamento sem horário', () => {
  // Arrange
  const { service } = criarCenario();

  // Act e Assert
  verificarErro(() => service.confirmar(dadosValidos({ time: '' })), 'HORARIO_OBRIGATORIO');
});

test('deve rejeitar nome com menos de dois caracteres', () => {
  // Arrange
  const { service } = criarCenario();

  // Act e Assert
  verificarErro(() => service.confirmar(dadosValidos({ name: 'A' })), 'DADOS_CLIENTE_INVALIDOS');
});

test('deve rejeitar telefone com menos de oito caracteres', () => {
  // Arrange
  const { service } = criarCenario();

  // Act e Assert
  verificarErro(() => service.confirmar(dadosValidos({ phone: '1234567' })), 'DADOS_CLIENTE_INVALIDOS');
});

test('deve bloquear horário já confirmado para o barbeiro', () => {
  // Arrange
  const { service, estado, persistencias } = criarCenario({
    bookings: [{ barberId: 'barbeiro-1', date: '2030-01-15', time: '09:00', status: 'confirmado' }]
  });

  // Act e Assert
  verificarErro(() => service.confirmar(dadosValidos()), 'HORARIO_OCUPADO');
  assert.equal(estado.bookings.length, 1);
  assert.equal(persistencias(), 0);
});

test('deve permitir mesmo horário para outro barbeiro', () => {
  // Arrange
  const { service, estado } = criarCenario({
    bookings: [{ barberId: 'barbeiro-2', date: '2030-01-15', time: '09:00', status: 'confirmado' }]
  });

  // Act
  const { agendamento } = service.confirmar(dadosValidos());

  // Assert
  assert.equal(agendamento.barberId, 'barbeiro-1');
  assert.equal(estado.bookings.length, 2);
});

test('deve permitir horário de atendimento concluído', () => {
  // Arrange
  const { service, estado } = criarCenario({
    bookings: [{ barberId: 'barbeiro-1', date: '2030-01-15', time: '09:00', status: 'concluido' }]
  });

  // Act
  const { agendamento } = service.confirmar(dadosValidos());

  // Assert
  assert.equal(agendamento.status, 'confirmado');
  assert.equal(estado.bookings.length, 2);
});

test('deve permitir horário de agendamento cancelado', () => {
  // Arrange
  const { service, estado } = criarCenario({
    bookings: [{ barberId: 'barbeiro-1', date: '2030-01-15', time: '09:00', status: 'cancelado' }]
  });

  // Act
  const { agendamento } = service.confirmar(dadosValidos());

  // Assert
  assert.equal(agendamento.status, 'confirmado');
  assert.equal(estado.bookings.length, 2);
});
