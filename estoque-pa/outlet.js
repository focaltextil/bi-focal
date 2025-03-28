const fileUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4eL_StwXZnZrikVfRucRYOO_stX6InEBMSNUIyF_e8r0aKN-ACp4u0QFVJ8JgyFGMu7ra1J7Fwaaw/pub?gid=872414139&single=true&output=csv';

let allData = [];

async function loadExcelData() {
    try {
       
        const savedData = sessionStorage.getItem('excelData1');
        if (savedData) {
          
            return JSON.parse(savedData);
        }

      
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Erro ao baixar a planilha: ${response.statusText}`);
        }
        const csvData = await response.text();

        const rows = csvData
            .split('\n')
            .map(row => {
                return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                    .map(cell => cell.replace(/^"|"$/g, '').trim());
            });

        rows.shift();

   
        sessionStorage.setItem('excelData1', JSON.stringify(rows));

        return rows;
    } catch (error) {
        console.error(`Erro ao carregar os dados: ${error.message}`);
        alert('Erro ao carregar os dados da planilha.');
        return [];
    }
}

function renderTable(data) {
    const renderContainer = document.getElementById("render-container");
    renderContainer.innerHTML = '';

    let totalEstoque = 0;

    data.forEach(row => {
        const tableRow = document.createElement("tr");

        const tdCodigo = document.createElement("td");
        tdCodigo.textContent = row[0] || 'Sem Codigo';

        const tdNome = document.createElement("td");
        tdNome.textContent = row[1] || 'Sem Nome';

        const tdEstoque = document.createElement("td");
        const estoque = parseFloat(row[2]?.replace(',', '.') || 0);
        totalEstoque += isNaN(estoque) ? 0 : estoque;
        tdEstoque.textContent = row[2]?.replace('.', ',') || '0';

        const tdLocalizacao = document.createElement("td");
        tdLocalizacao.textContent = row[3] || 'Sem Nome';

        const tdObs = document.createElement("td");
        tdObs.textContent = row[4] || '';

        tableRow.appendChild(tdCodigo);
        tableRow.appendChild(tdNome);
        tableRow.appendChild(tdEstoque);
        tableRow.appendChild(tdObs);
        tableRow.appendChild(tdLocalizacao);

        renderContainer.appendChild(tableRow);
    });

    const totalRow = document.createElement("div");
    totalRow.className = "total-row"; 

    totalRow.innerHTML = `
        <td colspan="2"><strong>Total:</strong></td>
        <td><strong>${totalEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></td>
        <td colspan="2"></td>
    `;

    renderContainer.appendChild(totalRow);
}


function renderCards(data) {
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = '';

    data.forEach(row => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-content">
                <h4>Codigo: ${row[0] || "Sem Codigo"}</h4>
                <p><strong>Nome:</strong> ${row[1] || "Sem Nome"}</p>
                <p><strong>Estoque:</strong> ${row[2]?.replace(".", ",") || "0"}</p>
                <p><strong>Obs:</strong> ${row[4] || ""}</p>
                <p><strong>Localização</strong> ${row[3] || ""}</p>
            </div>
        `;

        cardContainer.appendChild(card);
    });
}

function filterData(searchText) {
    const searchPattern = searchText.replace(/%/g, '.*');
    const regex = new RegExp(searchPattern, 'i');

    const filteredData = allData.filter(row => {
        return row.some(cell => regex.test(cell));
    });

    renderData(filteredData);
}

function updateView() {
    const isMobile = window.innerWidth <= 768;
    document.querySelector(".table-container").style.display = isMobile ? "none" : "block";
    document.querySelector(".card-container").style.display = isMobile ? "flex" : "none";
}

function renderData(data) {
    renderTable(data);
    renderCards(data); 
    renderTotalCard(data);
    updateView(); 
}

function renderTotalCard(data) {
    const cardContainer = document.getElementById("card-container");
    
    const totalEstoque = data.reduce((sum, row) => {
        const estoque = parseFloat(row[2]?.replace(",", ".") || 0); 
        return sum + (isNaN(estoque) ? 0 : estoque);
    }, 0);

    const totalCard = document.createElement("div");
    totalCard.className = "card total-card";
    totalCard.innerHTML = `
        <div class="card-content">
            <h3>Total do Estoque</h3>
            <p><strong>${totalEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
        </div>
    `;

    cardContainer.appendChild(totalCard);
}



async function init() {

    allData = await loadExcelData();
    renderData(allData);


    document.getElementById('searchInput').addEventListener('input', function () {
        const searchText = this.value.trim();
        if (searchText) {
            filterData(searchText);
        } else {
            renderData(allData);
        }
    });

    document.getElementById('reload').addEventListener('click', function () {
        sessionStorage.clear();
        window.location.reload();
    });
    

    window.addEventListener("resize", updateView);
    updateView();
}

window.onload = init;
