# DApp de Simulação: Tokenização da Obra "Amendoeira em Flor"

Uma Aplicação Descentralizada (DApp) de simulação desenvolvida para explorar o processo de tokenização da obra de arte "Amendoeira em Flor" de Vincent van Gogh. Este projeto demonstra como um ativo físico pode ser representado como um Non-Fungible Token (NFT) na blockchain Ethereum, permitindo a visualização dos seus metadados e a simulação de operações como cunhagem e transferência de propriedade.

## 📁 Estrutura do Projeto

O repositório contém os seguintes componentes principais:

* **`index.html`**: O ficheiro HTML principal da DApp, que define a estrutura da interface do utilizador e importa o `app.js`.

* **`app.js`**: O ficheiro JavaScript que contém toda a lógica da DApp, incluindo a interação com a blockchain (via Ethers.js), a gestão do estado da interface e as funções de cunhagem/transferência.

* **`ArtToken.sol`**: O código-fonte do contrato inteligente ERC-721, escrito em Solidity, que gerencia a criação e a propriedade do token de arte.

* **`metadados.json`**: Um ficheiro JSON que representa os metadados da obra "Amendoeira em Flor", simulando o conteúdo que seria armazenado no IPFS (InterPlanetary File System).

## ✨ Funcionalidades Principais

Esta DApp de simulação oferece as seguintes funcionalidades:

* **Visualização da Obra**: Exibe a imagem e os metadados detalhados da obra "Amendoeira em Flor".

* **Gestão de Token NFT**: Apresenta informações vitais do token (ID, proprietário, URI de metadados).

* **Interações Blockchain Simuladas**: Permite a cunhagem (`Mint`) e transferência de tokens na rede de teste.

* **Conexão e Verificação de Carteira**: Deteta e conecta-se à carteira MetaMask, verificando se a rede Sepolia está ativa.

## 🚀 Tecnologias Utilizadas

* **HTML5, CSS3 (Tailwind CSS)**: Para o frontend responsivo.

* **JavaScript (Ethers.js)**: Para interação com a blockchain.

* **Solidity**: Linguagem para o contrato inteligente ERC-721.

* **MetaMask**: Carteira Web3 para conexão e transações simuladas.

* **Rede Ethereum (Sepolia Testnet)**: Ambiente para testes e simulação do contrato.

* **IPFS (conceitual)**: Sistema de armazenamento descentralizado para metadados.

## ⚙️ Guia de Início Rápido

Siga estes passos para configurar e executar a DApp localmente no seu computador.

### Pré-requisitos

1.  **Instale e Configure o MetaMask:**

    * Obtenha a extensão MetaMask em [metamask.io](https://metamask.io/).

    * **Configure para a Rede Sepolia**: Abra o MetaMask, clique no seletor de redes (topo) e selecione "Sepolia Test Network". Se não estiver visível, ative "Mostrar redes de teste" em Definições > Avançado.

    * **Obtenha ETH de Teste**: Para realizar transações, obtenha ETH de teste em faucets como [sepoliafaucet.com](https://sepoliafaucet.com/).

### Execução Local da DApp

1.  **Clone o Repositório:**

    ```bash
    git clone https://github.com/Blarissa/DApp-Tokenizacao-Arte-AmendoeiraEmFlor
    ```

2.  **Inicie o Servidor Web Local:**
    Navegue até a pasta do projeto no seu `Terminal` (macOS/Linux) ou `Prompt de Comando (CMD)` (Windows) e execute:

    ```bash
    python3 -m http.server
    ```

    Você verá uma mensagem como: `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`

3.  **Acesse a DApp no Navegador:**
    Abra seu navegador e acesse: `http://localhost:8000`

### Como Usar a DApp

1.  **Conectar Carteira**: Ao carregar a página, a DApp tentará conectar-se automaticamente ao MetaMask. Confirme a permissão e certifique-se de que está na rede Sepolia.

2.  **Cunhar Token (Mint)**: Clique no botão "✨ Cunhar Token (Mint)". Uma transação simulada será iniciada via MetaMask. **Lembre-se: apenas o proprietário do contrato (onde este foi implementado) pode cunhar novos tokens.** O endereço do proprietário do contrato para esta simulação é `0x28ad1B6Fe1b2eEbbea73F5E05d33E55abBa225cC`.

3.  **Transferir Token**: Após a cunhagem, insira um endereço Ethereum válido no campo do destinatário e clique em "🔄 Transferir Token". Confirme a transação simulada no MetaMask.

## 🔗 Endereço do Contrato (Sepolia Testnet)

O contrato `ArtToken` utilizado nesta simulação está implementado na rede Sepolia no seguinte endereço:
`0x7f348a27d857182f5d23e70509ddfb5affb62f86`

## 🤝 Créditos

Desenvolvido para a disciplina de Tópicos em Computação Aplicada do Curso de Ciência da Computação da UFPI, sob orientação do Prof. Glauber Dias Gonçalves.

## 📄 Licença

Este projeto é de código aberto e está sob a Licença MIT.
