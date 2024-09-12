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
                // window.location.href = './login-sucess.html'
                const tela = document.getElementById('login-tela');
                tela.classList.add('sumir')
                // document.getElementById('message').innerText = "Logado";
            } else {
                document.getElementById('message').innerText = "Usuário ou senha incorretos!";
            }
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
});