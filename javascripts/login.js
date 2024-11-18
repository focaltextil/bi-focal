// // --------------------------LOGICA PARA LOGAR NA PLATAFORMA-----------------
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('crendencials/keys.json')
        .then(response => response.json())
        .then(data => {

            const user = data.find(item => item.user === username && item.password === password);

            if (user) {

                window.location.href = "./home.html";
                localStorage.setItem("logon", 1)
                localStorage.setItem("usuario",user.user)
            } else {

                document.getElementById('message').innerText = "Usuário ou senha incorretos!";
                document.getElementById('message').style.color = "red";
            }
        })
        .catch(error => {
            console.error('Erro ao carregar as credenciais:', error);
            document.getElementById('message').innerText = "Erro ao carregar dados de autenticação.";
        });
});

// --------------------------FIM--------------------------------------------------------------


