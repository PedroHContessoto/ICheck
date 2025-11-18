# Política de Privacidade da Extensão ICheck

**Última atualização:** 17 de novembro de 2025

## 1. Introdução

Bem-vindo à Política de Privacidade da extensão de navegador **ICheck** ("Extensão", "nós", "nosso").

O ICheck foi projetado desde o início com um princípio fundamental: **sua privacidade em primeiro lugar**. Acreditamos que a segurança online não deve custar sua privacidade. Esta política explica em detalhes quais dados coletamos (e, mais importante, quais não coletamos), como os usamos e como garantimos que você permaneça no controle total de suas informações.

Nossa filosofia é simples: **os seus dados são seus**. Eles nunca saem do seu computador.

Esta política foi elaborada para ser transparente e de fácil compreensão, em conformidade com as principais legislações de proteção de dados, como a Lei Geral de Proteção de Dados (LGPD) do Brasil e o Regulamento Geral sobre a Proteção de Dados (GDPR) da União Europeia.

## 2. O Controlador dos Dados

Para os fins da LGPD e do GDPR, o controlador dos dados que você gera ao usar a extensão é **você, o usuário**. A extensão opera de forma totalmente local no seu dispositivo.

O desenvolvedor da extensão, **Pedro Henrique Cavalhieri Contessoto**, não tem acesso, coleta, processa ou armazena qualquer um dos seus dados pessoais ou de navegação.

## 3. Dados que NÃO Coletamos

Esta é a seção mais importante desta política. O ICheck **NUNCA** coleta, armazena, transmite ou tem acesso a:

- **Seu histórico de navegação:** Não sabemos quais sites você visita.
- **Seus dados pessoais:** Nomes, endereços de e-mail, senhas, informações de contato, etc.
- **Seu endereço IP:** Sua localização ou identidade de rede.
- **Dados de formulários:** Informações que você digita em sites (senhas, cartões de crédito, etc.).
- **Cookies ou dados de rastreamento:** Não usamos cookies nem rastreadores de terceiros.
- **Telemetria ou dados de uso:** Não coletamos estatísticas sobre como você usa a extensão.
- **Qualquer informação que possa identificá-lo pessoalmente.**

A extensão não se comunica com nenhum servidor externo. Todo o seu funcionamento ocorre 100% localmente no seu navegador.

## 4. Dados que a Extensão Armazena (Localmente)

O ICheck armazena apenas os dados que **você explicitamente cria** para o funcionamento da extensão. Esses dados são salvos exclusivamente no seu dispositivo, usando a API `chrome.storage.local` do navegador.

Os únicos dados armazenados são:

| Tipo de Dado | Descrição | Finalidade | Onde é Armazenado |
|---|---|---|---|
| **Lista de Sites Confiáveis** | Uma lista dos hostnames que você marcou como "Confiável". | Para identificar sites seguros e exibir o badge verde (✓). | No seu computador (`chrome.storage.local`) |
| **Lista de Sites Não Confiáveis** | Uma lista dos hostnames que você marcou como "Não Confiável". | Para bloquear o acesso a sites maliciosos e exibir o alerta vermelho (✕). | No seu computador (`chrome.storage.local`) |
| **Configurações da Extensão** | Preferências de idioma e status da primeira instalação. | Para garantir o funcionamento correto da interface e do onboarding. | No seu computador (`chrome.storage.local`) |

**Importante:** Essas listas de sites são consideradas seus dados pessoais. No entanto, elas permanecem sob seu controle exclusivo e nunca são transmitidas para fora do seu dispositivo.

## 5. Como Utilizamos os Dados Armazenados

A finalidade dos dados armazenados é estritamente funcional e limitada a operar os recursos principais da extensão:

- **Verificar a URL atual:** Quando você visita um site, a extensão compara o hostname da página com as suas listas locais para determinar o status (confiável, não confiável ou desconhecido).
- **Atualizar o Badge do Ícone:** Com base na verificação, o ícone da extensão é atualizado com o badge visual correspondente (✓, ✕, !).
- **Exibir Alertas de Bloqueio:** Se você tentar acessar um site da sua lista de "Não Confiáveis", a extensão usa essa informação para bloquear a página e exibir um alerta em tela cheia.
- **Gerenciar Suas Listas:** Os dados são acessados no painel de opções para permitir que você visualize, pesquise, adicione ou remova sites.

Nenhum outro processamento é realizado.

## 6. Armazenamento e Segurança dos Dados

- **Armazenamento 100% Local:** Todos os dados são armazenados usando a API `chrome.storage.local`. Isso significa que os dados são salvos no seu perfil do navegador, no seu próprio disco rígido.
- **Segurança:** A segurança dos seus dados está diretamente ligada à segurança do seu computador e da sua conta de usuário no sistema operacional. A extensão não implementa camadas adicionais de criptografia, pois os dados nunca são transmitidos.
- **Sem Transmissão:** Repetimos: seus dados nunca são enviados pela internet para nenhum servidor, nem para o desenvolvedor nem para terceiros.

## 7. Compartilhamento e Divulgação de Dados

**O ICheck não compartilha, vende, aluga ou divulga seus dados a ninguém, sob nenhuma circunstância**, pois simplesmente não temos acesso a eles.

As únicas formas de seus dados saírem do armazenamento local são se **você, o usuário, decidir ativamente**: 

1.  **Exportar suas listas:** A extensão oferece uma função de "Exportar" que cria um arquivo JSON local no seu computador para fins de backup.
2.  **Sincronização do Navegador:** Se você estiver logado em uma Conta Google no Chrome e tiver a sincronização de extensões ativada, o próprio navegador poderá sincronizar os dados do `chrome.storage.local` entre seus dispositivos. Este é um processo do navegador, sobre o qual não temos controle, mas que é protegido pela política de privacidade do Google.

## 8. Seus Direitos de Proteção de Dados (LGPD e GDPR)

Você tem controle total e direto sobre seus dados. Você pode exercer seus direitos a qualquer momento, sem precisar de nossa intervenção:

- **Direito de Acesso:** Você pode acessar e visualizar suas listas de sites confiáveis e não confiáveis a qualquer momento no painel "Gerenciar Listas" da extensão.

- **Direito de Retificação:** Se você classificou um site incorretamente, pode removê-lo de uma lista e adicioná-lo à outra, corrigindo os dados instantaneamente.

- **Direito ao Apagamento ("Direito de Ser Esquecido"):** Você pode apagar sites individualmente ou usar a opção "Limpar Todas as Listas" no painel de gerenciamento para remover todos os seus dados permanentemente.

- **Direito à Portabilidade:** Você pode usar a função "Exportar Listas" para obter uma cópia completa dos seus dados em um formato JSON estruturado e legível por máquina.

Como pode ver, o design do ICheck garante que você possa exercer seus direitos de forma autônoma e imediata.

## 9. Privacidade de Crianças

O ICheck não coleta intencionalmente nenhuma informação de identificação pessoal de crianças. Como não coletamos dados pessoais de nenhum usuário, a privacidade das crianças está inerentemente protegida.

## 10. Código Aberto e Transparência

O ICheck é um projeto **100% open source**. Convidamos você a inspecionar nosso código-fonte a qualquer momento em nosso repositório no GitHub para verificar todas as afirmações feitas nesta política.

- **Repositório:** [https://github.com/PedroHContessoto/ICheck](https://github.com/PedroHContessoto/ICheck)

## 11. Alterações a Esta Política de Privacidade

Podemos atualizar esta Política de Privacidade ocasionalmente. Notificaremos sobre quaisquer alterações publicando a nova política nesta página e, se as alterações forem significativas, poderemos fornecer um aviso mais proeminente (como uma notificação na própria extensão).

Recomendamos que você revise esta Política de Privacidade periodicamente para quaisquer alterações.
