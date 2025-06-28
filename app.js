// Dados da obra de arte
const artworkData = {
    "name": "Amendoeira em Flor",
    "description": "Amendoeiras em Flor é um conjunto de pinturas de amendoeiras em flor, realizadas em 1888 e 1890 por Vincent van Gogh em Arles e Saint-Rémy, no sul da França. Árvores floridas eram especiais para Van Gogh. Elas representavam o despertar e a esperança.",
    "image": "https://ipfs.io/ipfs/bafkreic4q2uivp7hxkiphq2dh3pmkzsyklks3xmkk4o3xjprfaap2lwnra",
    "artist": "Vincent van Gogh",
    "year": "1890",
    "attributes": [
        {"trait_type": "Gênero", "value": "Paisagem"},
        {"trait_type": "Técnica", "value": "Óleo sobre tela"},
        {"trait_type": "Simbolismo", "value": "Despertar e Esperança"}
    ],
    "metadataURI": "ipfs://bafkreicowxds3tecqnmrbpizrao7fp22uilfhukkltqv66mbtlj7tofk6q"
};

// Constantes
const CONTRACT_ADDRESS = "0x7f348a27d857182f5d23e70509ddfb5affb62f86";
const SEPOLIA_CHAIN_ID = 11155111;
const ARTE_TOKEN_ID = 1;

// Variáveis globais
let provider;
let signer;
let artTokenContract;
let currentAccount = null;
let isTokenMinted = false;
let currentTokenOwner = "Nenhum";

// ABI do contrato
const ART_TOKEN_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "initialOwner", "type": "address"}],
        "stateMutability": "nonpayable", "type": "constructor"
    },
    {
        "inputs": [{"internalType": "address", "name": "recipient", "type": "address"}, {"internalType": "string", "name": "_metadataURI", "type": "string"}],
        "name": "mintArtwork", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable", "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "approved", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "Approval", "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "Transfer", "type": "event"
    },
    {
        "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "ownerOf", "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "tokenURI", "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view", "type": "function"
    }
];

// Função para exibir mensagens de status
function showStatus(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const statusSection = document.getElementById('transaction-status');
    if (!statusSection) return;
    
    const statusContainer = statusSection.querySelector('.space-y-3');
    if (!statusContainer) return;
    
    // Remover mensagem padrão se existir
    const defaultMessage = statusContainer.querySelector('.text-center');
    if (defaultMessage) {
        defaultMessage.remove();
    }
    
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-4 rounded-xl border ${getStatusClasses(type)} animate-slide-up`;
    messageDiv.innerHTML = `
        <div class="flex items-start space-x-3">
            <span class="flex-shrink-0 text-lg">${getStatusIcon(type)}</span>
            <div class="flex-1">
                <p class="font-medium text-sm">${getStatusTitle(type)}</p>
                <p class="text-sm opacity-90">${message}</p>
                <p class="text-xs opacity-70 mt-1">${timestamp}</p>
            </div>
        </div>
    `;
    
    // Inserir no topo
    statusContainer.insertBefore(messageDiv, statusContainer.firstChild);
    
    // Manter apenas as últimas 8 mensagens
    while (statusContainer.children.length > 8) {
        statusContainer.removeChild(statusContainer.lastChild);
    }
}

function getStatusClasses(type) {
    switch(type) {
        case 'success': return 'bg-green-50 text-green-800 border-green-200';
        case 'error': return 'bg-red-50 text-red-800 border-red-200';
        case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
        default: return 'bg-blue-50 text-blue-800 border-blue-200';
    }
}

function getStatusIcon(type) {
    switch(type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

function getStatusTitle(type) {
    switch(type) {
        case 'success': return 'Sucesso';
        case 'error': return 'Erro';
        case 'warning': return 'Aviso';
        default: return 'Informação';
    }
}

// Conectar carteira
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            showStatus('Solicitando conexão com MetaMask...', 'info');
            
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            currentAccount = await signer.getAddress();
            
            // Verificar rede
            const network = await provider.getNetwork();
            if (network.chainId !== SEPOLIA_CHAIN_ID) {
                showStatus('⚠️ Rede incorreta. Tentando trocar para Sepolia...', 'warning');
                
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
                    });
                    window.location.reload();
                    return;
                } catch (switchError) {
                    showStatus('❌ Não foi possível trocar para Sepolia. Faça isso manualmente.', 'error');
                    return;
                }
            }
            
            // Inicializar contrato
            artTokenContract = new ethers.Contract(CONTRACT_ADDRESS, ART_TOKEN_ABI, signer);
            
            // Atualizar UI
            updateWalletInfo();
            await loadExistingToken();
            
            showStatus(`Carteira conectada: ${currentAccount.substring(0, 8)}... (Sepolia)`, 'success');
            
            // Fechar modal se estiver aberto
            closeWalletConnectModal();
            
        } catch (error) {
            console.error('Erro ao conectar:', error);
            showStatus('Erro ao conectar carteira: ' + error.message, 'error');
        }
    } else {
        showStatus('MetaMask não encontrado. Por favor, instale a extensão.', 'error');
    }
}

// Atualizar informações da carteira
function updateWalletInfo() {
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    const connectBtn = document.getElementById('connect-wallet-btn');
    
    if (walletInfo && walletAddress && connectBtn && currentAccount) {
        walletInfo.classList.remove('hidden');
        walletAddress.textContent = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
        connectBtn.innerHTML = '<span class="hidden sm:inline">✅ Conectado</span><span class="sm:hidden">✅</span>';
        connectBtn.classList.remove('from-art-primary', 'to-art-primary-dark');
        connectBtn.classList.add('from-green-500', 'to-green-600');
        connectBtn.onclick = null;
    }
    
    // Habilitar botões
    enableButtons();
}

// Habilitar botões após conexão
function enableButtons() {
    const buttons = ['mint-btn', 'transfer-btn', 'refresh-token-btn', 'view-metadata-btn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

// Verificar se o token existe
async function verificarSeTokenExiste(tokenId) {
    try {
        await artTokenContract.ownerOf(tokenId);
        return true;
    } catch (error) {
        return false;
    }
}

// Carregar token existente
async function loadExistingToken(showSuccessMessage = true) {
    if (!artTokenContract || !currentAccount) return;
    
    try {
        const tokenExists = await verificarSeTokenExiste(ARTE_TOKEN_ID);
        
        if (tokenExists) {
            const tokenOwner = await artTokenContract.ownerOf(ARTE_TOKEN_ID);
            const tokenURI = await artTokenContract.tokenURI(ARTE_TOKEN_ID);
            
            // Atualizar elementos individuais
            updateTokenDisplay(ARTE_TOKEN_ID, tokenOwner, tokenURI);
            
            // Mostrar seção de informações do token
            await exibirTokenDeArte();
            
            currentTokenOwner = tokenOwner;
            isTokenMinted = true;
            
            if (showSuccessMessage) {
                showStatus(`Token #${ARTE_TOKEN_ID} carregado. Proprietário: ${tokenOwner.substring(0, 8)}...`, 'success');
            }
            
        } else {
            exibirFormularioMint();
            if (showSuccessMessage) {
                showStatus('Token ainda não foi cunhado', 'info');
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar token:', error);
        showStatus('Erro ao verificar status do token', 'error');
        exibirFormularioMint();
    }
}

// Atualizar display individual dos elementos do token
function updateTokenDisplay(tokenId, owner, tokenURI) {
    const elements = {
        'token-id': tokenId.toString(),
        'token-owner': `${owner.substring(0, 8)}...${owner.substring(owner.length - 6)}`,
        'metadata-uri': 'Ver Metadados'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'A') {
                element.href = tokenURI;
                element.textContent = value;
            } else {
                element.textContent = value;
            }
        }
    });
}

// Exibir token de arte existente
async function exibirTokenDeArte() {
    try {
        const owner = await artTokenContract.ownerOf(ARTE_TOKEN_ID);
        const tokenURI = await artTokenContract.tokenURI(ARTE_TOKEN_ID);
        
        const container = document.getElementById('token-info');
        if (container) {
            container.innerHTML = `
                <div class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                    <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <span class="mr-3">🎨</span>
                        Token NFT "Amendoeira em Flor"
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="bg-art-accent rounded-xl p-4">
                                <p class="text-sm font-semibold text-art-primary mb-1">🏷️ Token ID</p>
                                <p class="text-gray-900 font-mono text-lg">#${ARTE_TOKEN_ID}</p>
                            </div>
                            
                            <div class="bg-art-accent rounded-xl p-4">
                                <p class="text-sm font-semibold text-art-primary mb-1">👤 Proprietário</p>
                                <p class="text-gray-700 font-mono text-xs break-all">${owner}</p>
                                ${owner.toLowerCase() === currentAccount?.toLowerCase() ? 
                                    '<p class="text-green-600 text-sm mt-1">✅ Você é o proprietário</p>' : 
                                    '<p class="text-orange-600 text-sm mt-1">ℹ️ Você não é o proprietário</p>'
                                }
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="bg-art-accent rounded-xl p-4">
                                <p class="text-sm font-semibold text-art-primary mb-1">📄 Metadados URI</p>
                                <p class="text-gray-700 text-xs break-all font-mono">${tokenURI.substring(0, 50)}...</p>
                            </div>
                            
                            <div class="bg-art-accent rounded-xl p-4">
                                <p class="text-sm font-semibold text-art-primary mb-1">🔗 Status</p>
                                <p class="text-green-600 font-semibold">✅ Token Ativo</p>
                            </div>
                        </div>
                    </div>
                    
                    ${owner.toLowerCase() === currentAccount?.toLowerCase() ? `
                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4">🔄 Transferir Token</h4>
                            <div class="flex space-x-4">
                                <input 
                                    type="text" 
                                    id="recipient-address-input" 
                                    placeholder="0x..." 
                                    class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-art-primary/20 focus:border-art-primary transition-all duration-300 font-mono text-sm"
                                >
                                <button 
                                    onclick="transferirToken()" 
                                    class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    🚀 Transferir
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erro ao exibir token:', error);
        showStatus('Erro ao carregar informações do token', 'error');
    }
}

// Exibir formulário de mint
function exibirFormularioMint() {
    const container = document.getElementById('token-info');
    if (container) {
        container.innerHTML = `
            <div class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">⚡ Criar Token NFT</h3>
                    <p class="text-gray-600 mb-6">O token "Amendoeira em Flor" ainda não foi criado. Clique no botão abaixo para cunhar seu NFT.</p>
                    
                    <div class="bg-art-accent rounded-xl p-6 mb-6">
                        <img src="${artworkData.image}" alt="${artworkData.name}" class="w-full max-w-xs mx-auto h-48 object-cover rounded-lg shadow-lg mb-4">
                        <h4 class="text-lg font-semibold text-gray-900">${artworkData.name}</h4>
                        <p class="text-sm text-gray-600">por ${artworkData.artist} (${artworkData.year})</p>
                    </div>
                    
                    <button 
                        onclick="mintarTokenAmendoeira()" 
                        class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        ⚡ Cunhar Token NFT
                    </button>
                    
                    <p class="text-xs text-gray-500 mt-4">
                        ⚠️ Apenas o proprietário do contrato pode criar tokens
                    </p>
                </div>
            </div>
        `;
    }
}

// Função para cunhar o token
window.mintarTokenAmendoeira = async function() {
    if (!artTokenContract || !currentAccount) {
        showStatus('Conecte sua carteira primeiro', 'error');
        return;
    }

    try {
        showStatus('Verificando se você é o proprietário do contrato...', 'info');
        
        const contractOwner = await artTokenContract.owner();
        if (contractOwner.toLowerCase() !== currentAccount.toLowerCase()) {
            showStatus(`Apenas o proprietário do contrato pode criar tokens. Proprietário: ${contractOwner}`, 'error');
            return;
        }

        showStatus('Iniciando transação para criar o token...', 'info');
        
        const tx = await artTokenContract.mintArtwork(currentAccount, artworkData.metadataURI);
        showStatus(`Transação enviada: ${tx.hash}`, 'info');
        
        const receipt = await tx.wait();
        showStatus('Token criado com sucesso!', 'success');
        
        // Atualizar a interface
        setTimeout(() => {
            loadExistingToken();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao cunhar token:', error);
        showStatus('Erro ao cunhar token: ' + error.message, 'error');
    }
};

// Função para transferir token
window.transferirToken = async function() {
    const recipientInput = document.getElementById('recipient-address-input');
    if (!recipientInput) {
        showStatus('Campo de endereço não encontrado', 'error');
        return;
    }
    
    const recipient = recipientInput.value.trim();
    if (!recipient || !ethers.utils.isAddress(recipient)) {
        showStatus('Endereço do destinatário inválido', 'error');
        return;
    }

    if (recipient.toLowerCase() === currentAccount.toLowerCase()) {
        showStatus('Você não pode transferir para si mesmo', 'error');
        return;
    }

    try {
        showStatus('Iniciando transferência...', 'info');
        
        const tx = await artTokenContract.transferFrom(currentAccount, recipient, ARTE_TOKEN_ID);
        showStatus(`Transação enviada: ${tx.hash}`, 'info');
        
        const receipt = await tx.wait();
        showStatus('Token transferido com sucesso!', 'success');
        
        // Limpar input
        recipientInput.value = '';
        
        // Atualizar interface
        setTimeout(() => {
            loadExistingToken();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao transferir:', error);
        showStatus('Erro ao transferir token: ' + error.message, 'error');
    }
};

// Funções para modais
function openWalletConnectModal() {
    const modal = document.getElementById('walletconnect-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeWalletConnectModal() {
    const modal = document.getElementById('walletconnect-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Conectar carteira automaticamente se já autorizado
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
            if (accounts.length > 0) {
                connectWallet();
            }
        })
        .catch(console.error);
    }
    
    // Botão de atualizar
    const refreshBtn = document.getElementById('refresh-token-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (currentAccount && artTokenContract) {
                loadExistingToken();
                showStatus('Dados atualizados', 'success');
            } else {
                showStatus('Conecte sua carteira primeiro', 'error');
            }
        });
    }
    
    // Botão de visualizar metadados
    const metadataBtn = document.getElementById('view-metadata-btn');
    if (metadataBtn) {
        metadataBtn.addEventListener('click', async () => {
            if (!artTokenContract || !currentAccount) {
                showStatus('Conecte sua carteira primeiro', 'error');
                return;
            }
            
            try {
                const modal = document.getElementById('metadata-container');
                const content = document.getElementById('metadata-content');
                
                if (modal && content) {
					content.innerHTML = `
						<div class="space-y-6">
                        <!-- Header com imagem -->
                        <div class="text-center pb-6 border-b border-gray-200">
                            <div class="relative mx-auto w-80 h-64 mb-4 rounded-2xl overflow-hidden shadow-2xl">
                                <img 
                                    src="${artworkData.image}" 
                                    alt="${artworkData.name}" 
                                    class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    loading="lazy"
                                >
                                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">${artworkData.name}</h3>
                            <p class="text-lg text-gray-600">por <span class="font-semibold text-art-primary">${artworkData.artist}</span> (${artworkData.year})</p>
                        </div>

                        <!-- Metadados técnicos -->
                        <div class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                            <div class="flex items-center mb-4">
                                <span class="text-2xl mr-3">🔗</span>
                                <h4 class="text-lg font-semibold text-gray-900">Informações Técnicas</h4>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-white rounded-xl p-4 border border-gray-100">
                                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Metadata URI</p>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm text-gray-700 font-mono truncate flex-1">${artworkData.metadataURI.substring(0, 30)}...</span>
                                        <button 
                                            onclick="navigator.clipboard.writeText('${artworkData.image}'); showStatus('URI copiado!', 'success')"
                                            class="text-art-primary hover:text-art-primary-dark transition-colors duration-200"
                                            title="Copiar URI completo"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                                <div class="bg-white rounded-xl p-4 border border-gray-100">
                                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Padrão</p>
                                    <p class="text-sm font-semibold text-gray-900">ERC-721 NFT</p>
                                </div>
                            </div>
                        </div>

                        <!-- JSON expandível -->
                        <div class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center">
                                    <span class="text-2xl mr-3">📄</span>
                                    <h4 class="text-lg font-semibold text-gray-900">Metadados JSON</h4>
                                </div>
                                <button 
                                    id="toggle-json-btn"
                                    onclick="toggleJsonView()"
                                    class="text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-lg transition-colors duration-200"
                                >
                                    Mostrar JSON
                                </button>
                            </div>
                            <div id="json-content" class="hidden">
                                <div class="bg-gray-900 rounded-xl p-4 overflow-auto max-h-64">
                                    <pre class="text-green-400 text-xs font-mono leading-relaxed">${JSON.stringify({
                                        name: artworkData.name,
                                        description: artworkData.description,
                                        image: artworkData.image,
                                        artist: artworkData.artist,
                                        year: artworkData.year,
                                        attributes: artworkData.attributes
                                    }, null, 2)}</pre>
                                </div>
                                <div class="mt-3 flex justify-end">
                                    <button 
                                        onclick="copyJsonToClipboard()"
                                        class="text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                                    >
                                        <span>📋</span>
                                        <span>Copiar JSON</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Footer com links -->
                        <div class="pt-4 border-t border-gray-200">
                            <div class="flex flex-wrap justify-center gap-4 text-sm">
                                <a 
                                    href="${artworkData.image}" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    class="flex items-center space-x-2 text-art-primary hover:text-art-primary-dark transition-colors duration-200"
                                >
                                    <span>🔗</span>
                                    <span>Ver no IPFS</span>
                                </a>
                                <a 
                                    href="https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    class="flex items-center space-x-2 text-art-primary hover:text-art-primary-dark transition-colors duration-200"
                                >
                                    <span>🔍</span>
                                    <span>Ver Contrato</span>
                                </a>
                            </div>
                        </div>
                    </div>
                	`;
                    
                    modal.classList.remove('hidden');
                }
            } catch (error) {
                showStatus('Erro ao carregar metadados: ' + error.message, 'error');
            }
        });
    }

	window.toggleJsonView = function() {
		const jsonContent = document.getElementById('json-content');
		const toggleBtn = document.getElementById('toggle-json-btn');
		
		if (jsonContent && toggleBtn) {
			if (jsonContent.classList.contains('hidden')) {
				jsonContent.classList.remove('hidden');
				toggleBtn.textContent = 'Ocultar JSON';
			} else {
				jsonContent.classList.add('hidden');
				toggleBtn.textContent = 'Mostrar JSON';
			}
		}
	};

	window.copyJsonToClipboard = function() {
		const jsonData = JSON.stringify({
			name: artworkData.name,
			description: artworkData.description,
			image: artworkData.image,
			artist: artworkData.artist,
			year: artworkData.year,
			attributes: artworkData.attributes
		}, null, 2);
		
		navigator.clipboard.writeText(jsonData).then(() => {
			showStatus('JSON copiado para a área de transferência!', 'success');
		}).catch(() => {
			showStatus('Erro ao copiar JSON', 'error');
		});
	};
    
    // Fechar modal de metadados
    const closeMetadataBtn = document.getElementById('close-metadata-btn');
    const metadataModal = document.getElementById('metadata-container');
    
    if (closeMetadataBtn && metadataModal) {
        closeMetadataBtn.addEventListener('click', () => {
            metadataModal.classList.add('hidden');
        });
        
        // Fechar ao clicar no fundo
        metadataModal.addEventListener('click', (e) => {
            if (e.target === metadataModal) {
                metadataModal.classList.add('hidden');
            }
        });
    }
    
    // Listeners do MetaMask
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                window.location.reload();
            } else {
                currentAccount = null;
                showStatus('Carteira desconectada', 'warning');
            }
        });

        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }
    
    // Mensagem inicial
    setTimeout(() => {
        showStatus('DApp carregado! Conecte sua carteira para começar.', 'info');
    }, 1000);
});
