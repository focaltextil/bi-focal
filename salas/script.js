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

    document.getElementById('sala').addEventListener('change', () => {
        atualizarHorarios();
        atualizarListaOcupados();
    });


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

                    const { id, sala, data: dataReserva, hora_inicio, hora_fim, nome, titulo } = reserva;

                    const dataFormatada = new Date(dataReserva).toISOString().split('T')[0];

                    if (dataFormatada === dataFiltro) {

                        if (!horariosOcupados[sala]) horariosOcupados[sala] = {};

                        if (!horariosOcupados[sala][dataFiltro]) horariosOcupados[sala][dataFiltro] = [];

                        horariosOcupados[sala][dataFiltro].push({ id, nome, inicio: hora_inicio, fim: hora_fim, titulo: titulo });
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
        const tabela = document.getElementById('lista-horarios');
        const title = document.getElementById("agenda_title");
        const dataSelecionada = document.getElementById('data').value;
        const salaSelecionada = document.getElementById('sala').value;
    
        const data = new Date(`${dataSelecionada}T00:00:00`);
        const dataFormatada = data.toLocaleDateString('pt-BR');
    
        tabela.innerHTML = '';
        title.innerHTML = `${dataFormatada} - Sala ${salaSelecionada}`;
    
        const reservas = horariosOcupados[salaSelecionada]?.[dataSelecionada] || [];
    
        reservas
            .sort((a, b) => a.inicio.localeCompare(b.inicio))
            .forEach(intervalo => {
                const tr = document.createElement('tr');
    
                const tdNome = document.createElement('td');
                tdNome.textContent = intervalo.nome;
    
                const tdProfissional = document.createElement('td');
                tdProfissional.textContent = salaSelecionada;
    
                const tdInicio = document.createElement('td');
                tdInicio.textContent = formatarHorario(intervalo.inicio);
    
                const tdFim = document.createElement('td');
                tdFim.textContent = formatarHorario(intervalo.fim);
    
                const tdAcoes = document.createElement('td');
                const btnExcluir = document.createElement('button');
                btnExcluir.classList.add('btn-excluir');
                btnExcluir.textContent = 'Cancelar';
                
                btnExcluir.title = 'Excluir reserva';
                btnExcluir.dataset.id = intervalo.id;
                btnExcluir.style.cursor = 'pointer';
                btnExcluir.addEventListener('click', excluirReserva);
                tdAcoes.classList.add('col-acoes');
                tdAcoes.appendChild(btnExcluir);
    
                tr.appendChild(tdNome);
                tr.appendChild(tdProfissional);
                tr.appendChild(tdInicio);
                tr.appendChild(tdFim);
                tr.appendChild(tdAcoes);
    
                tabela.appendChild(tr);
            });
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

window.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    document.getElementById('data').value = `${ano}-${mes}-${dia}`;
    inputData.value = hoje;
});
