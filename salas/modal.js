window.addEventListener('load', function () {

    carregarHorariosOcupados();


    const btn_agendar = document.getElementById("btn_agendar");
    let horariosOcupados = {};

    function atualizarUser() {
        return sessionStorage.getItem("user_name") || "Usuário desconhecido";
    }

    function formatarHorario(horario) {
        return horario.slice(0, 5);
    }

    let user_name = atualizarUser();

    window.addEventListener("storage", function () {
        user_name = atualizarUser();
    });

    document.getElementById('data').addEventListener('change', carregarHorariosOcupados);

    document.getElementById('sala').addEventListener('change', atualizarHorarios);

    function carregarHorariosOcupados() {

        const dataFiltro = document.getElementById('data').value;

        if (!dataFiltro) return;

        fetch("http://192.168.1.229:8001/salas/horarios")

            .then(response => response.json())

            .then(data => {

                spinner.style.display = "none";

                horariosOcupados = {};

                data.forEach(reserva => {
                    const { id, sala, data: dataReserva, hora_inicio, hora_fim, nome, titulo } = reserva;
                    const dataFormatada = new Date(dataReserva).toISOString().split('T')[0];

                    if (dataFormatada === dataFiltro) {
                        if (!horariosOcupados[sala]) horariosOcupados[sala] = {};
                        if (!horariosOcupados[sala][dataFiltro]) horariosOcupados[sala][dataFiltro] = [];

                        horariosOcupados[sala][dataFiltro].push({ id, nome, inicio: hora_inicio, fim: hora_fim, titulo });
                    }
                });

                atualizarHorarios();
            })
            .catch(error => console.error("Erro ao buscar horários:", error));
    }

    function atualizarHorarios() {
        const dataEscolhida = document.getElementById('data').value;
        const salaEscolhida = document.getElementById('sala').value;
        const horaInicioSelect = document.getElementById('hora-inicio');

        if (!dataEscolhida || !salaEscolhida) return;

        horaInicioSelect.innerHTML = '';

        let horariosRestantes = [...gerarHorariosDisponiveis()];
        let horariosOcupadosSala = horariosOcupados[salaEscolhida]?.[dataEscolhida] || [];

        horariosOcupadosSala.forEach(({ fim }) => {
            const fimFormatado = formatarHorario(fim);
            if (!horariosRestantes.includes(fimFormatado)) {
                horariosRestantes.push(fimFormatado);
            }
        });

        horariosRestantes.sort();

        horariosRestantes = horariosRestantes.filter(horario => {
            return !horariosOcupadosSala.some(({ inicio, fim }) =>
                (horario > formatarHorario(inicio) && horario < formatarHorario(fim))
            ) || horariosOcupadosSala.some(({ fim }) => horario === formatarHorario(fim));
        });

        horariosRestantes.forEach(horario => {
            horaInicioSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
        });

        horaInicioSelect.addEventListener('change', atualizarHoraFim);
    }

    function atualizarHoraFim() {
        const horaInicio = document.getElementById('hora-inicio').value;
        const horaFimSelect = document.getElementById('hora-fim');
        horaFimSelect.innerHTML = '';

        if (!horaInicio) return;

        let horariosOcupadosSala = horariosOcupados[document.getElementById('sala').value]?.[document.getElementById('data').value] || [];

        const horariosDisponiveis = gerarHorariosDisponiveis().filter(horario =>
            horario > horaInicio || horariosOcupadosSala.some(({ fim }) => horario === fim)
        );

        horariosDisponiveis.forEach(horario => {
            horaFimSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
        });
    }

    function gerarHorariosDisponiveis() {
        const horarios = [];
        for (let h = 7; h < 18; h++) {
            horarios.push(`${h.toString().padStart(2, '0')}:00`);
            horarios.push(`${h.toString().padStart(2, '0')}:30`);
        }
        return horarios;
    }



    const btn_abrir_modal = document.getElementById('btn_abrir');
    
    btn_abrir_modal.addEventListener('click', function(){

        document.getElementById('modal').style.display = 'flex';

    });

    const btn_fechar_modal = document.getElementById('btn_fechar');
    
    btn_fechar_modal.addEventListener('click', function(){

        document.getElementById('modal').style.display = 'none';

    });

    btn_agendar.addEventListener("click", async function (e) {
        
        e.preventDefault();

        const spinner = document.getElementById('spinner');

        spinner.style.display = "flex";

        const nome = user_name;
        const salaEscolhida = document.getElementById('sala').value;
        const titulo_reuniao = document.getElementById('titulo').value.trim();
        const dataEscolhida = document.getElementById('data').value;
        const horaInicio = document.getElementById('hora-inicio').value;
        const horaFim = document.getElementById('hora-fim').value;

        if (!salaEscolhida || !dataEscolhida || !horaInicio || !horaFim || !titulo_reuniao) {
            alert("Por favor, preencha todos os campos.");
            spinner.style.display = "none";
            return;
        }

        if (horaFim <= horaInicio) {
            alert("O horário de fim deve ser posterior ao horário de início.");
            spinner.style.display = "none";
            return;
        }

        const reservasNaSala = horariosOcupados[salaEscolhida]?.[dataEscolhida] || [];

        if (reservasNaSala.some(intervalo =>
            !(formatarHorario(intervalo.fim) <= horaInicio || formatarHorario(intervalo.inicio) >= horaFim) &&
            formatarHorario(intervalo.fim) !== horaInicio
        )) {
            alert("Erro: Já existe uma reserva para essa sala nesse horário.");
            spinner.style.display = "none";
            return;
        }

        const reserva = {
            nome,
            sala: salaEscolhida,
            data: dataEscolhida,
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            titulo: titulo_reuniao
        };

        try {
            const response = await fetch("http://192.168.1.229:8001/salas/reserva_input", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reserva)
            });

            const respostaTexto = await response.text();
            console.log("Resposta do servidor:", respostaTexto);

            if (response.ok) {
                document.getElementById('data').dispatchEvent(new Event('change'));
                document.getElementById('modal').style.display = 'none';
                // alert("Reserva incluída com sucesso!");
                window.location.href = 'index.html';
            }
            else {
                alert("Erro ao fazer a reserva.");
            }

            spinner.style.display = "none";
        } catch (error) {
            console.error("Erro ao conectar com o servidor:", error);

            alert("Erro ao conectar com o servidor.");
            spinner.style.display = "none";
        }
    });
  

});

window.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    document.getElementById('data').value = `${ano}-${mes}-${dia}`;
});
