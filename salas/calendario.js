document.addEventListener('DOMContentLoaded', async function () {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "flex";

  const container = document.getElementById('ano-completo');

  const response = await fetch('https://api-tbpreco.onrender.com/horarios');
  const dados = await response.json();

  const eventos = dados.map(item => {
    const data = item.data.split('T')[0];
    const titulo = item.titulo.toLowerCase();

    let corFundo = '#046A96';
    if (titulo.includes('supere')) corFundo = '#12DEC6';
    else if (titulo.includes('fechamento rmcs')) corFundo = '#F7B400';
    else if (titulo.includes('comitê de sustentabilidade')) corFundo = '#00AF4D';
    else if (titulo.includes('semanal gerentes')) corFundo = '#AEAAAA';
    else if (titulo.includes('comitê 6s')) corFundo = '#9D6B99';
    else if (titulo.includes('cipa')) corFundo = '#5B1E4C';
    else if (titulo.includes('auditoria (selo origem sustentável)')) corFundo = '#833C0C';
    else if (titulo.includes('feriado')) corFundo = '#00FF1E';
    else if (titulo.includes('evento')) corFundo = '#9b59b6';

    return {
      title: `${item.titulo} - ${item.nome}`,
      start: `${data}T${item.hora_inicio}`,
      end: `${data}T${item.hora_fim}`,
      extendedProps: {
        tituloOriginal: titulo,
        sala: item.sala,
        id: item.id
      },
      color: corFundo
    };
  });

  // Legenda
  const legendaContainer = document.createElement('div');
  legendaContainer.id = 'legenda-eventos';
  legendaContainer.style.display = 'flex';
  legendaContainer.style.flexWrap = 'wrap';
  legendaContainer.style.gap = '10px';
  legendaContainer.style.margin = '20px 0';
  legendaContainer.style.fontFamily = 'sans-serif';
  legendaContainer.style.fontSize = '14px';
  legendaContainer.style.flexDirection = 'column';

  const tituloLegenda = document.createElement('h2');
  tituloLegenda.textContent = 'Legenda de Eventos';
  tituloLegenda.style.marginBottom = '10px';
  tituloLegenda.style.fontSize = '18px';
  tituloLegenda.style.fontWeight = 'bold';
  tituloLegenda.style.fontFamily = 'sans-serif';
  legendaContainer.appendChild(tituloLegenda);

  const legendas = [
    { cor: '#046A96', texto: 'Eventos Padrão' },
    { cor: '#5B1E4C', texto: 'Cipa' },
    { cor: '#12DEC6', texto: 'Supere' },
    { cor: '#F7B400', texto: 'Fechamento RMCS' },
    { cor: '#00AF4D', texto: 'Comitê de Sustentabilidade' },
    { cor: '#AEAAAA', texto: 'Semanal Gerentes' },
    { cor: '#9D6B99', texto: 'Comitê 6S' },
    { cor: '#833C0C', texto: 'Auditoria (Selo Origem Sustentável)' },
    { cor: '#00FF1E', texto: 'Feriado' },
  ];

  const legendasWrapper = document.createElement('div');
  legendasWrapper.style.display = 'flex';
  legendasWrapper.style.flexWrap = 'wrap';
  legendasWrapper.style.gap = '10px';

  legendas.forEach(item => {
    const legendaItem = document.createElement('div');
    legendaItem.style.display = 'flex';
    legendaItem.style.alignItems = 'center';
    legendaItem.style.gap = '5px';

    const corBox = document.createElement('span');
    corBox.style.width = '16px';
    corBox.style.height = '16px';
    corBox.style.backgroundColor = item.cor;
    corBox.style.display = 'inline-block';
    corBox.style.borderRadius = '3px';

    const texto = document.createElement('span');
    texto.textContent = item.texto;

    legendaItem.appendChild(corBox);
    legendaItem.appendChild(texto);
    legendasWrapper.appendChild(legendaItem);
  });

  legendaContainer.appendChild(legendasWrapper);
  container.parentNode.insertBefore(legendaContainer, container.nextSibling);

  // CALENDÁRIO ÚNICO
  const calendar = new FullCalendar.Calendar(container, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    headerToolbar: {
      left: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
      center: 'title',
      right: 'prev,next today'
    },
    hiddenDays: [0, 6],
    events: eventos,

    // Limita horário exibido entre 07:00 e 17:00
    slotMinTime: '07:00:00',
    slotMaxTime: '17:00:00',

    eventClick: function (info) {
      alert(
        `Título: ${info.event.title}\n` +
        `Sala: ${info.event.extendedProps.sala}\n` +
        `Início: ${info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
        `Fim: ${info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
    },

    dayCellDidMount: function (info) {
      const data = info.date.toISOString().split('T')[0];
      const diasColorir = ["2025-01-01", "2025-03-04", "2025-04-18", "2025-04-21",
        "2025-05-01", "2025-06-19", "2025-07-09", "2025-11-28", "2025-12-08", "2025-12-25"];

      if (diasColorir.includes(data)) {
        info.el.style.backgroundColor = "#00FF1E";
        info.el.style.borderRadius = "6px";
      }
    }
  });

  calendar.render();
});
