
// Logica de logar

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('keys.json')
        .then(response => response.json())
        .then(data => {
            
            const validUsername = data.user;
            const validPassword = data.password;

           
            if (username === validUsername && password === validPassword) {
          
                const link = document.getElementById('link');
                const tela = document.getElementById('login-tela');
                tela.classList.add('sumir')
                link.src = data.dashComercial;
               
            } else {
                document.getElementById('message').innerText = "Usuário ou senha incorretos!";
            }
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
});