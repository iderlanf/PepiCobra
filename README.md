# PepiCobra
Aplicativo móvel e web desenvolvido exclusivamente para a Pepi Store com o objetivo de gerenciar o fluxo de cobranças de parcelas de clientes e facilitar a notificação semiautomática através do WhatsApp.

Gerenciador de Cobranças — Pepi Store

Este é um aplicativo móvel e web desenvolvido exclusivamente para a Pepi Store com o objetivo de gerenciar o fluxo de cobranças de parcelas de clientes e facilitar a notificação semiautomática através do WhatsApp.

Instagram Oficial: @pepilingerie - https://www.instagram.com/pepilingerie/  
Desenvolvedor: Desenvolvido por Iderlan Fortaleza - https://github.com/iderlanf - De forma autônoma sob medida para a marca.


Funcionalidades Principais

* Vínculo Nativo com a Agenda: Permite abrir a lista telefônica original do smartphone para selecionar o cliente, capturando o nome e formatando o número de telefone de forma automatizada.
* Banco de Dados Local Seguro: Utiliza persistência estruturada em SQLite dentro do aparelho celular (custo zero de servidores e total privacidade).
* Controle de Vencimentos em Aberto: Listagem dinâmica em tempo real de todas as parcelas pendentes organizadas por ordem cronológica.
* Edição e Prorrogação de Prazos: Permite alterar/adiar a data de vencimento de uma cobrança diretamente pelo cartão do cliente.
* Notificação Inteligente via WhatsApp: Dispara o aplicativo oficial do WhatsApp contendo uma mensagem personalizada com o valor e os dados para pagamento.
* Sistema Independente de Backup: Botões para exportar toda a base de dados para os documentos do celular/nuvem e botão para restaurar os dados de arquivos salvos.


Identidade Visual Customizada

O visual do aplicativo foi completamente adaptado para combinar com a identidade visual da Pepi Store:
* Logo Oficial: Centralizada no topo do formulário de cadastro.
* Trava de Layout: Configuração estrita que desativa a inversão forçada de temas escuros do sistema operacional, mantendo a legibilidade e contraste originais da marca.


Tecnologias Utilizadas

* Framework Base: Ionic v7+ com React e TypeScript.
* Motor Nativo: Capacitor v6+.
* Banco de Dados: `@capacitor-community/sqlite`.
* Agenda de Contatos: `@capacitor-community/contacts`.
* Disparo de Apps: `@capacitor/app-launcher`.


Estrutura dos Dados Gravados (SQLite)

Tabela: `cobrancas`

|       Campo        |                           Descrição                     |
|                    |                                                         |
|      **id**        |  Identificador único da cobrança                        |
|  **nome_cliente**  |  Nome extraído da agenda telefônica                     |
|   **telefone**     |  Número formatado apenas com dígitos                    |
| **valor_parcela**  |  Campo numérico representando o valor em Reais (R$)     |
| **data_pagamento** |  Data de vencimento no formato estruturado `YYYY-MM-DD` |
|    **status**      |  Define a situação do débito (`Pendente` ou `Pago`)     |


Modelo da Mensagem Enviada

> Olá, **[Nome do Cliente]**! Passando para lembrar que a sua parcela no valor de **[Valor R$]** venceu em **[Data DD/MM/YYYY]**.
> 
> Para sua comodidade, você pode efetuar o pagamento via PIX:  
>
> *Chave CNPJ: 26341659000103  
> *Favorecida: PERPÉTUO SOCORRO  
> 
> Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem. Obrigada!


Como Rodar e Compilar o Projeto

-Pré-requisitos
Certifique-se de possuir o Node.js e o Android Studio atualizados em sua máquina de desenvolvimento.

1. Executar no Navegador do Computador
O aplicativo funciona no computador como um sistema web de gerenciamento (os dados ficam guardados no navegador):
# Iniciar o servidor local do Ionic: ionic serve

*Nota: No computador, a agenda nativa não estará disponível, exigindo preenchimento manual do telefone.

2. Sincronizar e Preparar para Celular Android
Sempre que fizer alterações visuais ou lógicas no VS Code, execute a sequência de comandos abaixo no terminal do projeto:
# Compilar os arquivos do React para distribuição: npm run build
# Sincronizar os arquivos compilados e os plugins com a pasta nativa: npx cap sync
# Abrir o projeto diretamente no Android Studio: npx cap open android
