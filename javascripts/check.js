
function Logado() {
  
    const logon = localStorage.getItem("logon");
    const usuario = localStorage.getItem("usuario");
    const dashcomercial = document.getElementById('dashcomercial');
    const dashamostras = document.getElementById('dashamostras');
    const dashrep = document.getElementById('dashrep');
    const frota = document.getElementById('frota');
    const btn_exit = document.querySelector('.exit');
    const tela  = document.getElementById('tela');

    if (logon === "1" && usuario === "guarita") {

        dashcomercial.style.display = "none";
        dashamostras.style.display = "none";
        dashrep.style.display = "none";
        frota.style.display = "none";
        tela.setAttribute("src","https://guarita-qwdptzehtb6cpykgwt67ka.streamlit.app/?embed=true");

    } else {
        console.log("Não logado");
    }


    btn_exit.addEventListener("click", function Exit(){
        window.location.href = "index.html"
    })
        

}


window.onload = Logado;

