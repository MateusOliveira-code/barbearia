# Arquitetura da funcionalidade de agendamento

A prática da Aula 9 foi aplicada à **Issue #1 — Cliente**, especificamente ao caso de uso de confirmação de agendamento.

## Fluxo

```text
View / app.js
      |
      v
AgendamentoController
      |
      v
AgendamentoService
      |
      +------------------> Agendamento (Model)
      |
      v
AgendamentoRepository
      |
      v
Estado da aplicação / LocalStorage
```

## Responsabilidades

### View / `app.js`

Captura os dados preenchidos na interface e atualiza a tela com o resultado. A View não decide se um horário pode ser utilizado nem cria diretamente o agendamento.

### `AgendamentoController`

Recebe os dados da interface e delega a execução para o Service. Também transforma erros conhecidos em uma resposta simples para a View.

### `AgendamentoService`

Concentra as regras do caso de uso:

- exige ao menos um serviço;
- valida se os serviços continuam ativos;
- valida se o barbeiro está ativo;
- exige data e horário;
- valida os dados básicos do cliente;
- impede dois agendamentos confirmados para o mesmo barbeiro, data e horário;
- localiza ou cria o cliente;
- cria o agendamento confirmado.

### `AgendamentoRepository`

Isola o acesso ao estado da aplicação. Ele consulta horários, clientes, serviços e barbeiros e salva clientes/agendamentos sem conhecer a interface.

### `Agendamento`

Representa o conceito de agendamento e concentra sua estrutura inicial: cliente, barbeiro, serviços, data, horário, status e data de criação.

## Decisão arquitetural

A refatoração mantém o protótipo sem backend e sem banco externo, porque isso não faz parte das três histórias atuais. O LocalStorage continua sendo usado como persistência local, mas o caso de uso de agendamento deixou de depender diretamente dessa implementação.
