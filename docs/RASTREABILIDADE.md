# Rastreabilidade das histórias

Este documento relaciona as três histórias de usuário do backlog com as funcionalidades implementadas no protótipo.

| História | Critério principal | Implementação |
|---|---|---|
| #1 Cliente | Exibir serviços com nome, descrição e preço | Cards da área Cliente |
| #1 Cliente | Exibir calendário e horários disponíveis | Campo de data + grade de horários |
| #1 Cliente | Selecionar profissional | Cards de barbeiros ativos |
| #1 Cliente | Selecionar múltiplos serviços | Seleção múltipla nos cards |
| #1 Cliente | Gerenciar agendamentos futuros | Lista “Próximos horários” + cancelamento |
| #2 Barbeiro | Agenda do dia por barbeiro | Área Barbeiro filtrada pelo profissional selecionado |
| #2 Barbeiro | Ver detalhes do atendimento | Cliente, serviços, contato e valor na agenda |
| #2 Barbeiro | Marcar como concluído | Botão “Concluir” |
| #2 Barbeiro | Liberar horário após conclusão | Somente agendamentos confirmados bloqueiam horários |
| #2 Barbeiro | Registrar valor final | Modal de conclusão + resumo de faturamento |
| #3 Administrador | Cadastrar/editar/inativar barbeiros e clientes | Aba Usuários |
| #3 Administrador | Preservar histórico de usuários | Inativação em vez de exclusão |
| #3 Administrador | Cadastrar serviços | Aba Serviços |
| #3 Administrador | Editar preço, nome e descrição | Modal de edição de serviço |
| #3 Administrador | Remover ou desativar serviços | Ações Remover / Desativar |

## Fluxo sugerido para apresentação

1. **Cliente:** escolher Corte + Barba, selecionar profissional e horário, informar dados e confirmar.
2. **Cliente:** visualizar o agendamento criado e demonstrar o cancelamento.
3. **Barbeiro:** abrir a agenda, visualizar os detalhes e concluir um atendimento registrando o valor.
4. **Administrador:** cadastrar um usuário, inativar um barbeiro, editar um serviço e demonstrar a desativação.
