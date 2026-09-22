# Barbearia do Rafa

Sistema web desenvolvido como projeto da disciplina de **Engenharia de Software**, com foco em requisitos, User Stories, critérios de aceitação, prototipação e rastreabilidade no GitHub.

O projeto foi implementado com base em três histórias de usuário: **Cliente**, **Barbeiro** e **Administrador**.

## Status do projeto

As três histórias previstas para esta entrega foram implementadas e concluídas.

- [x] Issue #1 — Cliente
- [x] Issue #2 — Barbeiro
- [x] Issue #3 — Administrador

As Issues estão finalizadas no GitHub Project e a implementação principal está registrada no commit `99416e0`.

## Funcionalidades

### Cliente

O cliente pode:

- visualizar os serviços disponíveis com descrição, duração e preço;
- selecionar um ou mais serviços;
- escolher o barbeiro de preferência;
- selecionar data e horário disponível;
- confirmar um agendamento;
- visualizar seus próximos agendamentos;
- cancelar agendamentos futuros.

Os horários já ocupados são bloqueados automaticamente para evitar conflito de agenda.

### Barbeiro

O barbeiro pode:

- visualizar sua agenda do dia;
- consultar cliente, serviços e valor previsto de cada atendimento;
- marcar um atendimento como concluído;
- registrar o valor final cobrado;
- acompanhar o resumo do dia;
- visualizar quantidade de atendimentos, pendências e faturamento.

Ao concluir um atendimento, o horário deixa de permanecer bloqueado na agenda.

### Administrador

O administrador pode:

- cadastrar barbeiros e clientes;
- editar dados dos usuários;
- ativar ou inativar usuários;
- cadastrar novos serviços;
- editar nome, descrição, duração e preço dos serviços;
- ativar ou desativar serviços;
- remover serviços sem histórico de agendamentos.

Quando um serviço já possui histórico, ele é desativado em vez de excluído definitivamente.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage

O projeto não utiliza framework, backend ou banco de dados externo nesta versão.

## Persistência dos dados

Os dados do protótipo são armazenados no **LocalStorage** do navegador.

Isso permite demonstrar o funcionamento do sistema sem servidor ou banco de dados, mantendo as alterações realizadas durante o uso no mesmo navegador.

Também existe uma opção para restaurar os dados de demonstração.

## Como executar

Clone o repositório:

```bash
git clone https://github.com/MateusOliveira-code/barbearia.git
```

Entre na pasta:

```bash
cd barbearia
```

Depois, abra o arquivo `index.html` no navegador.

Também é possível iniciar um servidor local:

```bash
python -m http.server 8000
```

E acessar:

```text
http://localhost:8000
```

## Estrutura do projeto

```text
barbearia/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── data.js
├── docs/
│   └── RASTREABILIDADE.md
├── .gitignore
└── README.md
```

## Rastreabilidade

O desenvolvimento foi organizado a partir das histórias de usuário registradas como Issues:

- [Issue #1 — Visualizar Serviços, Horários e Profissionais (Cliente)](https://github.com/MateusOliveira-code/barbearia/issues/1)
- [Issue #2 — Gestão da Agenda e Conclusão de Atendimento (Barbeiro)](https://github.com/MateusOliveira-code/barbearia/issues/2)
- [Issue #3 — Gerenciamento de Usuários e Serviços (Administrador)](https://github.com/MateusOliveira-code/barbearia/issues/3)

O documento [RASTREABILIDADE.md](docs/RASTREABILIDADE.md) relaciona cada critério de aceitação com a funcionalidade correspondente no sistema.

O quadro de acompanhamento do projeto está disponível em:

[GitHub Project — Barbearia](https://github.com/users/MateusOliveira-code/projects/2)

## Fluxo sugerido para demonstração

Para apresentar o sistema, uma sequência simples é:

1. Acessar o perfil **Cliente**.
2. Selecionar serviços, profissional, data e horário.
3. Confirmar o agendamento.
4. Acessar o perfil **Barbeiro** e localizar o atendimento.
5. Concluir o atendimento e registrar o valor final.
6. Acessar o perfil **Administrador**.
7. Demonstrar o cadastro ou edição de um usuário e de um serviço.

## Escopo desta versão

Esta entrega contempla somente as três histórias definidas no projeto.

Não fazem parte do escopo atual:

- pagamento online;
- autenticação real;
- banco de dados externo;
- controle de estoque;
- relatórios avançados;
- notificações;
- avaliações de clientes.

Essas funcionalidades podem ser consideradas em versões futuras sem alterar o escopo desta entrega.

## Próxima etapa

A próxima etapa do projeto é disponibilizar a aplicação online utilizando **GitHub Pages**, facilitando a demonstração sem necessidade de baixar os arquivos.
