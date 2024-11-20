// Configuração da API
const clientID 
const clientSecret 
const scope = 'user-read-private user-read-email';
const url_authorization = 'https://accounts.spotify.com/authorize';
const redirectUri = 'http://localhost:8000';

// Função de login no Spotify
function loginSpotify() {
    const endpointAuthorization = `${url_authorization}?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=12345`;
    window.location = endpointAuthorization;
}

// Função para obter o token de acesso
async function getAccessToken(code) {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const data = new URLSearchParams();

    // Adicionar parâmetros necessários
    data.append('code', code);
    data.append('redirect_uri', redirectUri);
    data.append('grant_type', 'authorization_code');

    // Credenciais codificadas em Base64
    const clientCredentials = `${clientID}:${clientSecret}`;
    const encodedCredentials = btoa(clientCredentials);

    const headers = {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: headers,
        body: data
    });

    if (!response.ok) {
        console.error('Erro ao obter o token:', response.statusText);
        return null;
    }

    const responseData = await response.json();
    return responseData.access_token;
}

// Função para obter informações do usuário
async function getUserInfo(token) {
    const userEndpoint = 'https://api.spotify.com/v1/me';

    const response = await fetch(userEndpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.error('Erro ao obter informações do usuário:', response.statusText);
        return null;
    }

    const userData = await response.json();
    return userData;
}

// Verificar se há código na URL (redirecionamento após login)
window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            const token = await getAccessToken(code);

            if (token) {
                const user = await getUserInfo(token);

                if (user) {
                    // Exibe o nome do usuário na página
                    document.getElementById('user-info').style.display = 'block';
                    document.getElementById('user-name').textContent = user.display_name;
                }
            }
        } catch (error) {
            console.error('Erro no fluxo de autenticação:', error);
        }
    }
};

// Evento de clique para login
document.getElementById("login-btn").addEventListener("click", () => {
    loginSpotify();
});
