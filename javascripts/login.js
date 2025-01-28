
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

    

    const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSU6o-0moYLxGrlKiKFjFav-PFmUKG79CCL4WTOT7q7pQ8_LFqtDGf3uoKhgHqVORc0a8yJrbjThAM2/pub?gid=0&single=true&output=csv';

    fetch(googleSheetsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao acessar o arquivo de credenciais.');
            }
            return response.text();
        })
        .then(csvData => {
    
            const rows = csvData.split('\n').map(row => row.split(','));
            const headers = rows[0];
            const data = rows.slice(1).map(row => {
                return row.reduce((acc, value, index) => {
                    acc[headers[index].trim()] = value.trim();
                    return acc;
                }, {});
            });

      
            const user = data.find(item => item.user === username && item.password === password && item.Status === "LIBERADO");

            if (user) {
                localStorage.setItem("logon", 1);
                localStorage.setItem("usuario", user.user);
                window.location.replace(user.tela);
            } else {
                message.innerText = "Usuário ou senha incorreto!";
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
