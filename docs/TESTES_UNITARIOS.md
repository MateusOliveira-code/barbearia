# Aula 12 — Testes unitários

## Funcionalidade escolhida

Confirmação de agendamentos da Issue #1 (Cliente), implementada em `AgendamentoService`. A classe foi criada na atividade de arquitetura em camadas e usa `AgendamentoRepository` para consultar e salvar dados.

## Cenários definidos antes dos testes

| Nº | Cenário | Resultado esperado |
| --- | --- | --- |
| 1 | Confirmar um agendamento com dados válidos | Cria cliente e agendamento confirmado |
| 2 | Informar telefone de cliente já cadastrado | Reaproveita cadastro existente, sem duplicar |
| 3 | Selecionar dois serviços ativos | Mantém os dois serviços no agendamento |
| 4 | Não selecionar nenhum serviço | Retorna `SERVICO_OBRIGATORIO` |
| 5 | Selecionar serviço inativo | Retorna `SERVICO_INDISPONIVEL` |
| 6 | Selecionar barbeiro inativo | Retorna `BARBEIRO_OBRIGATORIO` |
| 7 | Não informar data | Retorna `HORARIO_OBRIGATORIO` |
| 8 | Não informar horário | Retorna `HORARIO_OBRIGATORIO` |
| 9 | Informar nome com apenas um caractere | Retorna `DADOS_CLIENTE_INVALIDOS` |
| 10 | Informar telefone com sete caracteres | Retorna `DADOS_CLIENTE_INVALIDOS` |
| 11 | Tentar confirmar um horário já ocupado | Retorna `HORARIO_OCUPADO` e não salva |
| 12 | Escolher horário ocupado por outro barbeiro | Permite confirmar normalmente |
| 13 | Escolher horário de atendimento concluído | Permite novo agendamento |
| 14 | Escolher horário de agendamento cancelado | Permite novo agendamento |

Os cenários cobrem fluxo normal, valores mínimos, ausência de dados e regras de negócio que impedem agendamentos inválidos.

## Implementação

Os testes ficam em `tests/agendamento.service.test.js`, seguem o padrão Arrange–Act–Assert e usam `node:test` com `node:assert/strict` (Node.js 18 ou superior). Não foi necessário instalar pacotes.

Como os arquivos da aplicação foram feitos para rodar no navegador, o teste carrega somente Model, Repository e Service em um contexto isolado do Node.js. Cada caso cria seu próprio estado em memória. Assim, não há dependência de interface, LocalStorage, banco de dados ou rede.

## Execução

Na pasta do projeto:

```bash
npm test
```

Os testes devem passar sem alterações na implementação atual. Caso uma regra seja modificada no futuro, basta executar o comando novamente para verificar possíveis regressões.

## Entrega

Pull Request com a suíte de 14 testes e a documentação desta atividade. A implementação original do agendamento foi mantida, pois os cenários puderam ser testados sem refatoração adicional.
