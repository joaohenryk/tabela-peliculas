// Função para carregar os dados do CSV e exibi-los na tabela
async function carregarDados() {
    // Fazendo a requisição do arquivo CSV
    const response = await fetch("dados.csv");
    const data = await response.text();
    
    // Separa os dados em linhas, removendo a primeira linha (cabeçalho)
    const linhas = data.split("\n").slice(1);
    
    // Seleciona o elemento onde a tabela será inserida
    const tabela = document.querySelector("#tabela");

    // Objeto para armazenar os dados agrupados por marca
    const dadosAgrupados = {};

    // Percorre cada linha do CSV e organiza os dados por marca
    linhas.forEach(linha => {
        const colunas = linha.split(","); // Separa os valores da linha por vírgula

        // Verifica se a linha tem pelo menos 3 colunas (marca, modelo, compatibilidade)
        if (colunas.length >= 3) {
            const marca = colunas[0].trim(); // Marca do celular
            const modelo = colunas[1].trim(); // Modelo do celular
            const compatibilidade = colunas[2].trim(); // Tipo de compatibilidade

            // Se a marca ainda não existe no objeto, cria um array para ela
            if (!dadosAgrupados[marca]) {
                dadosAgrupados[marca] = [];
            }

            // Adiciona o modelo e a compatibilidade no array da marca correspondente
            dadosAgrupados[marca].push({ modelo, compatibilidade });
        }
    });

    // Ordena os modelos dentro de cada marca em ordem alfabética
    for (const marca in dadosAgrupados) {
        dadosAgrupados[marca].sort((a, b) => a.modelo.localeCompare(b.modelo, "pt-BR", { numeric: true }));
    }

    // Limpa a tabela antes de recriar os elementos
    tabela.innerHTML = "";

    // Para cada marca, cria o conteúdo da tabela
    for (const marca in dadosAgrupados) {
        // Cria um contêiner para a marca
        const divMarca = document.createElement("div");
        divMarca.classList.add("marca-container");

        // Cria o título com o nome da marca
        const titulo = document.createElement("h2");
        titulo.textContent = marca;
        divMarca.appendChild(titulo);

        // Cria a estrutura da tabela para essa marca
        const tableElement = document.createElement("table");
        tableElement.classList.add("marca-table");
        tableElement.innerHTML = `
            <thead>
                <tr>
                    <th>Modelo</th>
                    <th>Compatibilidade</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        // Preenche a tabela com os dados da marca
        const tbody = tableElement.querySelector("tbody");
        dadosAgrupados[marca].forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.modelo}</td>
                <td>${item.compatibilidade}</td>
            `;
            tbody.appendChild(tr);
        });

        // Adiciona a tabela da marca dentro do contêiner
        divMarca.appendChild(tableElement);

        // Adiciona o contêiner da marca na tabela principal
        tabela.appendChild(divMarca);
    }
}

// Função para destacar o termo pesquisado na tabela
function highlightTerm(text, term) {
    if (term === "") return text; // Se o termo estiver vazio, retorna o texto normal

    // Cria uma expressão regular para buscar o termo e destacar
    const regex = new RegExp(`(${term})`, "gi"); 
    return text.replace(regex, `<mark>$1</mark>`); // Envolvem o termo com a tag <mark> para destaque
}

// Função para aplicar a pesquisa
document.getElementById("search").addEventListener("keyup", function () {
    const termo = this.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Normaliza o termo para comparar com o texto sem acentuação

    // Para cada marca, realiza a busca e aplica o destaque
    document.querySelectorAll(".marca-container").forEach(divMarca => {
        const table = divMarca.querySelector("table");
        let temResultado = false;

        // Para cada linha da tabela, verifica se o modelo ou compatibilidade contém o termo pesquisado
        table.querySelectorAll("tbody tr").forEach(tr => {
            const modelo = tr.children[0].textContent;
            const compatibilidade = tr.children[1].textContent;

            // Normaliza o texto de modelo e compatibilidade para facilitar a comparação
            const modeloLower = modelo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const compatibilidadeLower = compatibilidade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // Verifica se o termo está em qualquer uma das colunas (modelo ou compatibilidade)
            if (modeloLower.includes(termo) || compatibilidadeLower.includes(termo)) {
                tr.style.display = ""; // Mostra a linha
                temResultado = true;

                // Destaca o termo pesquisado no modelo e na compatibilidade
                tr.children[0].innerHTML = highlightTerm(modelo, termo);
                tr.children[1].innerHTML = highlightTerm(compatibilidade, termo);
            } else {
                tr.style.display = "none"; // Esconde a linha se não houver correspondência
            }
        });

        // Se não houver resultados, esconde a marca
        divMarca.style.display = temResultado ? "" : "none";
    });
});

// Chama a função de carregar os dados ao carregar a página
carregarDados();
