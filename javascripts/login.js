

// Para carregar o login salvo, ao carregar a página
window.addEventListener('load', function () {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    

    if (savedUsername && savedPassword) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
    }
});

// --------------------------LOGICA PARA LOGAR NA PLATAFORMA-----------------
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('keys.json')
        .then(response => response.json())
        .then(data => {

            const validUsername = data.user;
            const validPassword = data.password;

            if (username === validUsername && password === validPassword) {

                // Salvar login no localStorage
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);

                const tela = document.getElementById('login-tela');
                tela.classList.add('sumir');
                link.src = data.dashComercial;
                let logado = localStorage.setItem("tela",tela);
            } else {
                document.getElementById('message').innerText = "Usuário ou senha incorretos!";
            }
        });


    // ------------------------LOGICA DOS BOTOES-----------------

    const btnrep = document.getElementById('btn-rep');

    btnrep.addEventListener('click', function () {
        fetch('keys.json')
            .then(response => response.json())
            .then(data => {
                link.src = data.dashRepresentantes;
            })
    });


    const btncomercial = document.getElementById('btn-comercial');

    btncomercial.addEventListener('click', function () {
        fetch('keys.json')
            .then(response => response.json())
            .then(data => {
                link.src = data.dashComercial;
            })
    });


    const btnmalharia = document.getElementById('btn-amostras');
    const link = document.getElementById('link');

    btnmalharia.addEventListener('click', function () {
        fetch('keys.json')
            .then(response => response.json())
            .then(data => {
                console.log("Botão clicado!");
                link.src = data.dashamostras;
            })
            .catch(error => console.error('Erro ao carregar o arquivo JSON:', error));
    });

});


// --------------------------FIM-----------------