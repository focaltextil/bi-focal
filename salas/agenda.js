document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');
  let idSelecionado = null;
  const usuario = sessionStorage.getItem("user_name");

  const response = await fetch(`https://api-tbpreco.onrender.com/filtrar_agendamentos/${usuario}`);
  const dados = await response.json();

  console.log(dados);

  const eventos = dados.data.map(item => {
    const data = item.data.split('T')[0];
    const cor = item.cor || '#e0a80b';

    return {
      id: item.id,
      title: `${item.titulo}`,
      start: `${data}T${item.hora_inicio}`,
      end: `${data}T${item.hora_fim}`,
      color: cor,
      extendedProps: {
        titulo: item.titulo
      }
    };
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    hiddenDays: [0],
    nowIndicator: true,
    slotMinTime: "07:00:00",
    slotMaxTime: "18:00:00",
    allDaySlot: false,
    handleWindowResize: true,
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: eventos,

    dayCellClassNames(info) {
      return (info.date.getDay() === 6 || info.date.getDay() === 0) ? 'fc-sabado-domingo' : '';
    },

    eventClick(info) {
      document.getElementById('popupNome').textContent = info.event.extendedProps.titulo;
      document.getElementById('popupInicio').textContent = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      document.getElementById('popupFim').textContent = info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      idSelecionado = info.event.id;
      document.getElementById('popupReserva').classList.remove('hidden');
    },

    datesSet() {
      const toolbar = calendarEl.querySelector('.fc-header-toolbar');
      if (toolbar && !toolbar.querySelector('.custom-icons')) {
        const iconsContainer = document.createElement('div');
        iconsContainer.classList.add('custom-icons');

        const icons = [{ icon: 'note_add', color: '#ffffff', id: 'btn_abrir' }];
        icons.forEach(({ icon, color, id }) => {
          const link = document.createElement('a');
          link.title = icon;
          link.style.textDecoration = 'none';

          const span = document.createElement('span');
          span.classList.add('material-symbols-outlined');
          span.textContent = icon;
          span.style.color = color;
          span.id = id;

          link.appendChild(span);
          iconsContainer.appendChild(link);
        });

        toolbar.appendChild(iconsContainer);

        document.getElementById('btn_abrir').addEventListener('click', () => {
        });
      }
    }
  });

  calendar.render();

 

  // Enviar novo agendamento
  document.getElementById("btn_agendar").addEventListener("click", async function (e) {
    e.preventDefault();

    const nome = sessionStorage.getItem("user_name");
    const titulo = document.getElementById("titulo").value;
    const data = document.getElementById("data").value;
    const hora_inicio = document.getElementById("hora-inicio").value;
    const hora_fim = document.getElementById("hora-fim").value;

    if (!nome || !titulo || !data || !hora_inicio || !hora_fim) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    try {
      const response = await fetch("https://api-tbpreco.onrender.com/insert_compromisso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, titulo, data, hora_inicio, hora_fim })
      });

      const result = await response.json();

      if (response.ok) {
        alert("Compromisso inserido com sucesso!");

        calendar.addEvent({
          id: result.id || Date.now(),
          title: `${nome} - ${titulo}`,
          start: `${data}T${hora_inicio}`,
          end: `${data}T${hora_fim}`,
        });

        document.getElementById("form").reset();
        document.getElementById("modal_agendamento").classList.add("hidden");
      } else {
        alert(result.error || "Erro ao inserir compromisso.");
      }

    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao conectar com o servidor.");
    }
  });


    document.getElementById("fechar_modal").addEventListener("click", () => {
    document.getElementById("modal_agendamento").classList.add("hidden");
  });
});
