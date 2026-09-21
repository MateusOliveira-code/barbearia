# Barbearia do Rafa

Protótipo funcional desenvolvido para a disciplina de Engenharia de Software, limitado às **3 histórias de usuário** atualmente definidas no projeto: Cliente, Barbeiro e Administrador.

## Direção visual

A interface foi refeita para se aproximar de sites reais de barbearia: visual editorial escuro, tipografia clássica, poucas cores, preços e duração visíveis e agendamento mantido na própria página. O objetivo foi evitar aparência de dashboard genérico e manter a navegação direta.

## Escopo implementado

### Issue #1 — Cliente
- Visualização dos serviços ativos, descrição, duração e preço.
- Seleção de um ou mais serviços.
- Escolha do barbeiro.
- Calendário/data e horários disponíveis.
- Bloqueio automático de horários já confirmados.
- Confirmação de agendamento com nome e telefone.
- Visualização e cancelamento de agendamentos futuros do cliente.

### Issue #2 — Barbeiro
- Seleção do barbeiro para simular o profissional logado.
- Agenda filtrada pelo dia atual e pelo barbeiro.
- Exibição de cliente, serviços e valor previsto.
- Conclusão do atendimento.
- Registro do valor final cobrado.
- Resumo do dia com total de atendimentos, concluídos, pendentes e faturamento.
- Ao concluir, o horário deixa de ficar bloqueado para novos agendamentos.

### Issue #3 — Administrador
- Cadastro e edição de barbeiros e clientes.
- Ativação e inativação de usuários sem excluir o histórico.
- Cadastro e edição de serviços.
- Alteração de nome, preço, duração e descrição.
- Ativação, desativação e remoção de serviços.
- Se um serviço já estiver em algum agendamento, a remoção definitiva é substituída por desativação para preservar o histórico.

## Tecnologias

- HTML5
- CSS3 responsivo
- JavaScript puro
- LocalStorage para persistência local do protótipo

Não há backend, banco de dados externo ou autenticação real. A troca de perfil Cliente / Barbeiro / Administrador existe apenas para demonstrar as três histórias de usuário.

## Como executar

1. Baixe ou clone o projeto.
2. Abra `index.html` no navegador.
3. Use a navegação superior para alternar entre Cliente, Barbeiro e Administrador.

Também é possível executar na pasta do projeto:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Estrutura

```text
barbearia-sistema/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   └── app.js
├── docs/
│   └── RASTREABILIDADE.md
├── .gitignore
└── README.md
```

## Observação sobre o escopo

O projeto foi mantido propositalmente enxuto. Não foram adicionados pagamento, estoque, relatórios avançados, autenticação real, notificações, avaliações, galeria ou outras funcionalidades fora das três histórias atuais.
