const listaRegistros = document.getElementById("lista-registros");
const modalEditar = document.getElementById("modal-editar");
const campoData = document.getElementById("campo-data");
const campoHora = document.getElementById("campo-hora");
const campoTipo = document.getElementById("campo-tipo");
const campoObs = document.getElementById("campo-obs");  // Campo de observação
const botaoSalvar = document.getElementById("botao-salvar");
const botaoFechar = document.getElementById("botao-fechar");

let pontos = JSON.parse(localStorage.getItem("register")) || [];

// Função para exibir os pontos na tabela
function exibirPontos() {
    listaRegistros.innerHTML = ""; // Limpa a tabela antes de adicionar os pontos

    pontos.forEach((ponto, index) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${ponto.data}</td>
            <td>${ponto.hora}</td>
            <td>${ponto.tipo}</td>
            <td>${ponto.localizacao.latitude}, ${ponto.localizacao.longitude}</td>
            <td>${ponto.obs || ''}</td> <!-- Exibe a observação -->
            <td>${ponto.anexo || ''}</td>
            <td><button class="editar" data-index="${index}">Editar</button></td>
        `;
        listaRegistros.appendChild(linha);
    });

    // Adiciona os listeners para o botão de editar
    const botoesEditar = document.querySelectorAll(".editar");
    botoesEditar.forEach(botao => {
        botao.addEventListener("click", (evento) => {
            const index = evento.target.dataset.index;
            abrirModalEditar(index);
        });
    });
}

// Função para abrir o modal de edição
function abrirModalEditar(index) {
    const ponto = pontos[index];

    // Preenche os campos do modal com os dados do ponto
    campoData.value = ponto.data;
    campoHora.value = ponto.hora;
    campoTipo.value = ponto.tipo;
    campoObs.value = ponto.obs || '';  // Preenche a observação com o valor do ponto

    // Salva o índice do ponto para editar depois
    botaoSalvar.dataset.index = index;

    modalEditar.showModal();
}

// Função para salvar a edição
botaoSalvar.addEventListener("click", () => {
    const index = botaoSalvar.dataset.index;

    // Atualiza os dados do ponto com os valores do modal
    pontos[index].data = campoData.value;
    pontos[index].hora = campoHora.value;
    pontos[index].tipo = campoTipo.value;
    pontos[index].obs = campoObs.value;  // Atualiza a observação

    // Atualiza o localStorage com os novos valores
    localStorage.setItem("register", JSON.stringify(pontos));

    // Fecha o modal e atualiza a tabela
    modalEditar.close();
    exibirPontos();  // Atualiza a tabela com os dados editados
});

// Função para fechar o modal
botaoFechar.addEventListener("click", () => {
    modalEditar.close();
});

function getRegisterLocalStorage(register) {
    let registers = JSON.parse(localStorage.getItem(register));
    if (!registers) {
        return [];
    }
    return registers;
}

// Inicializa a tabela com os dados do localStorage
exibirPontos();
