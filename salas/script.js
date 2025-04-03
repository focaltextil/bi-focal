window.addEventListener('load', function () {
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

    document.getElementById('sala').addEventListener('change', atualizarHorarios);

    document.getElementById('data').addEventListener('change', carregarHorariosOcupados);

    function carregarHorariosOcupados() {

        spinner.style.display = "flex";

        const dataFiltro = document.getElementById('data').value;

        if (!dataFiltro) return;

        fetch("https://api-tbpreco.onrender.com/horarios")

            .then(response => response.json())

            .then(data => {

                spinner.style.display = "none";

                horariosOcupados = {};

                data.forEach(reserva => {

                    const { id, sala, data: dataReserva, hora_inicio, hora_fim, nome } = reserva;

                    const dataFormatada = new Date(dataReserva).toISOString().split('T')[0];

                    if (dataFormatada === dataFiltro) {

                        if (!horariosOcupados[sala]) horariosOcupados[sala] = {};

                        if (!horariosOcupados[sala][dataFiltro]) horariosOcupados[sala][dataFiltro] = [];

                        horariosOcupados[sala][dataFiltro].push({ id, nome, inicio: hora_inicio, fim: hora_fim });
                    }
                });

                atualizarListaOcupados();

                atualizarHorarios();
            })

            .catch(error => console.error("Erro ao buscar horários:", error));
    }

    function atualizarHorarios() {

        const dataEscolhida = document.getElementById('data').value;

        const salaEscolhida = document.getElementById('sala').value;

        const horaInicioSelect = document.getElementById('hora-inicio');

        const horaFimSelect = document.getElementById('hora-fim');

        if (!dataEscolhida || !salaEscolhida) return;

        horaInicioSelect.innerHTML = '';

        horaFimSelect.innerHTML = '';

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

    function atualizarListaOcupados() {

        const lista = document.getElementById('lista-horarios');

        lista.innerHTML = '';

        for (let sala in horariosOcupados) {

            for (let data in horariosOcupados[sala]) {

                horariosOcupados[sala][data].forEach(intervalo => {

                    const li = document.createElement('li');

                    li.innerHTML = `<strong>${intervalo.nome}</strong> reservou <strong>${sala}</strong> das ${intervalo.inicio} até ${intervalo.fim}`;
                    if (intervalo.nome === user_name) {

                        const btnExcluir = document.createElement('button');

                        btnExcluir.classList.add('btn-excluir');

                        btnExcluir.textContent = 'Excluir';

                        btnExcluir.dataset.id = intervalo.id;

                        btnExcluir.addEventListener('click', excluirReserva);

                        li.appendChild(btnExcluir);
                    }
                    lista.appendChild(li);
                });
            }
        }
    }

    async function excluirReserva(event) {

        const spinner = document.getElementById('spinner');

        spinner.style.display = "flex";

        try {
            const idReserva = event.target.getAttribute('data-id');

            const response = await fetch(`https://api-tbpreco.onrender.com/delete_agendamento/${idReserva}`, {

                method: "DELETE",

            });


            if (!response.ok) {

                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            spinner.style.display = "none"; 

            document.getElementById('data').dispatchEvent(new Event('change'));

        } catch (error) {

            alert("Erro ao excluir reserva: " + error.message);

            spinner.style.display = "none";
        }
    }

    btn_agendar.addEventListener("click", async function (e) {

        e.preventDefault();

        const spinner = document.getElementById('spinner');

        spinner.style.display = "flex";

        const nome = user_name;

        const salaEscolhida = document.getElementById('sala').value;

        const dataEscolhida = document.getElementById('data').value;
        
        const horaInicio = document.getElementById('hora-inicio').value;

        const horaFim = document.getElementById('hora-fim').value;

        if (!salaEscolhida || !dataEscolhida || !horaInicio || !horaFim) {

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
        
        const reserva = { nome, sala: salaEscolhida, data: dataEscolhida, hora_inicio: horaInicio, hora_fim: horaFim };

        try {
            const response = await fetch("https://api-tbpreco.onrender.com/reserva_input", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify(reserva)

            });

            if (response.ok) {

                spinner.style.display = "none";

                document.getElementById('data').dispatchEvent(new Event('change'));

            } else {

                alert("Erro ao fazer a reserva.");

                spinner.style.display = "none";
            }
        } catch (error) {

            alert("Erro ao conectar com o servidor.");
            
            spinner.style.display = "none";
        }
    });
});
