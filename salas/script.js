window.addEventListener('load', function () {

    carregarHorariosOcupados();

    const btn_agendar = document.getElementById("btn_agendar");
    let horariosOcupados = [];

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

    function carregarHorariosOcupados() {
        const spinner = document.getElementById('spinner');
        spinner.style.display = "flex";

        fetch("https://api-tbpreco.onrender.com/horarios")
            .then(response => response.json())
            .then(data => {
                spinner.style.display = "none";

                horariosOcupados = data.filter(reserva => reserva.nome === user_name);
                atualizarListaOcupados();
            })
            .catch(error => {
                console.error("Erro ao buscar horários:", error);
                spinner.style.display = "none";
            });
    }

    function atualizarListaOcupados() {
        const tabela = document.getElementById('lista-horarios');
        const title = document.getElementById("agenda_title");

        tabela.innerHTML = '';
        title.innerHTML = `Todos os seus compromissos`;

        horariosOcupados
            .sort((a, b) => new Date(a.data + 'T' + a.hora_inicio) - new Date(b.data + 'T' + b.hora_inicio))
            .forEach(reserva => {
                const tr = document.createElement('tr');

                const tdNome = document.createElement('td');
                tdNome.textContent = reserva.nome;

                const tdTitulo = document.createElement('td');
                tdTitulo.textContent = reserva.titulo;

                const tdSala = document.createElement('td');
                tdSala.textContent = reserva.sala;

                const tdData = document.createElement('td');
                tdData.textContent = new Date(reserva.data).toLocaleDateString('pt-BR');

                const dataPartes = reserva.data.split('T')[0].split('-');
                tdData.textContent = `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;

                

                const tdInicio = document.createElement('td');
                tdInicio.textContent = formatarHorario(reserva.hora_inicio);

                const tdFim = document.createElement('td');
                tdFim.textContent = formatarHorario(reserva.hora_fim);

                const tdAcoes = document.createElement('td');
                tdAcoes.classList.add('col-acoes');

                const btnExcluir = document.createElement('button');
                btnExcluir.classList.add('btn-excluir');
                btnExcluir.textContent = 'Cancelar';
                btnExcluir.title = 'Excluir reserva';
                btnExcluir.dataset.id = reserva.id;
                btnExcluir.style.cursor = 'pointer';
                btnExcluir.addEventListener('click', excluirReserva);
                tdAcoes.appendChild(btnExcluir);

                tr.appendChild(tdNome);
                tr.appendChild(tdTitulo);
                tr.appendChild(tdSala);
                tr.appendChild(tdData);
                tr.appendChild(tdInicio);
                tr.appendChild(tdFim);
                tr.appendChild(tdAcoes);

                tabela.appendChild(tr);
            });
    }

    async function excluirReserva(event) {
        const spinner = document.getElementById('spinner');
        const btnExcluir = event.target;
        btnExcluir.disabled = true;
        spinner.style.display = "flex";

        try {
            const idReserva = event.target.getAttribute('data-id');
            const response = await fetch(`https://api-tbpreco.onrender.com/delete_agendamento/${idReserva}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            carregarHorariosOcupados();
        } catch (error) {
            alert("Erro ao excluir reserva: " + error.message);
        } finally {
            spinner.style.display = "none";
            btnExcluir.disabled = false;
        }
    }

});
