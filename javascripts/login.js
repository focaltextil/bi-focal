// --------------------------SALVAR LOGIN NO LOCAL STORAGE-----------------

// window.addEventListener('load', function () {
//     let login_result = localStorage.getItem("login");
//     let tela = document.getElementById('login-tela');

//     if(login_result === "1"){
//         tela.classList.add('sumir');

//         }else{
//             login_result = 0;
//         }

// });

// --------------------------LOGICA PARA LOGAR NA PLATAFORMA-----------------

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('crendencials/keys.json')
        .then(response => response.json())
        .then(data => {

            const validUsername = data.user;
            const validPassword = data.password;

            if (username === validUsername && password === validPassword) {

                window.location.href = "./home.html"
            } else {
                document.getElementById('message').innerText = "Usuário ou senha incorretos!";
            }
    });
});


// --------------------------FIM--------------------------------------------------------------