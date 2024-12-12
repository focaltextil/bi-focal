document.getElementById('btn_entrar').addEventListener('click', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const message = document.getElementById('message');

    if (!username || !password) {
        message.innerText = "Preencha todos os campos.";
        message.style.color = "red";
        return;
    }

    fetch('crendencials/keys.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao acessar o arquivo de credenciais.');
            }
            return response.json();
        })
        .then(data => {
            const user = data.find(item => item.user === username && item.password === password);

            if (user) {
                localStorage.setItem("logon", 1);
                localStorage.setItem("usuario", user.user);
                window.location.replace(user.tela);
            } else {
                message.innerText = "Usuário ou senha incorretos!";
                message.style.color = "red";
            }
        })
        .catch(error => {
            console.error('Erro ao carregar as credenciais:', error);
            message.innerText = "Erro ao carregar dados de autenticação.";
            message.style.color = "red";
        });
});


function Logado() {
    document.addEventListener("click", function (event) {
    
        if (event.target && event.target.classList.contains("exit")) {
            localStorage.clear();
            localStorage.setItem("logon", 0);
            window.location.replace("index.html");
        }
    });
}


window.onload = function () {
    Logado();
};
