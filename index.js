// Elementos data e hora no início
const diaSemana = document.getElementById("dia-semana")
const diaMesAno = document.getElementById("dia-mes-ano")
const horaMinSeg = document.getElementById("hora-min-seg")

const btnBaterPonto = document.getElementById("btn-bater-ponto")

// Elementos popup
const popUp = document.getElementById("pop-up")
const btnClosePopUp = document.getElementById("btn-close-pop-up")

let registerLocalStorage = getRegisterLocalStorage()

// Elementos do dialog
const dialogPonto = document.getElementById("dialog-ponto")
const selectDialogTipo = document.getElementById("select-dialog-tipo")
const btnDialogRegistrar = document.getElementById("btn-dialog-registrar")
const btnDialogFechar = document.getElementById("btn-dialog-fechar")
const dialogData = document.getElementById("dialog-data")
const dialogHora = document.getElementById("dialog-hora")
const dialogDataInput = document.getElementById("dialog-data-input")
const dialogHoraInput = document.getElementById("dialog-hora-input")
const btnEditData = document.getElementById("btn-edit-data")
const btnEditHora = document.getElementById("btn-edit-hora")
const dialogBoxObs = document.getElementById("box-obs")
const fileUpload = document.getElementById("file-upload");
const dialogUltimoPonto = document.getElementById("dialog-ultimo-ponto")

// Variáveis
let hourInterval
let inputHour = null
let inputDate = null

btnClosePopUp.addEventListener("click", () => popUp.className = "not-visible")
btnBaterPonto.addEventListener("click", register)

btnEditData.addEventListener("click", showInputData)
btnEditHora.addEventListener("click", showInputHora)

btnDialogFechar.addEventListener("click", () => {dialogPonto.close(); stopHourInterval()})

dialogDataInput.addEventListener("input", (event) => {
    inputDate = event.target.value; // Armazena o valor do input
});

dialogHoraInput.addEventListener("input", (event) => {
    inputHour = event.target.value; // Armazena o valor do input
});

btnDialogRegistrar.addEventListener("click", async () => {

    // Recuperar data, hora, localização e tipo e salva em objeto javascript
    let userCurrentPosition = await getCurrentPosition()

    // Formatar e verificar data
    let date = inputDate ? formatDate(inputDate) : getCurrentDate()
    if (isFutureDate(date)) 
    {
        alert("A data não pode ser no futuro.")
        return
    }

    // Recuperar arquivo anexo
    let file = fileUpload.files[0]

    let ponto = {
        data: date,
        hora: inputHour || getCurrentHour(),
        localizacao: userCurrentPosition,
        id: 1,
        tipo: selectDialogTipo.value,
        obs: dialogBoxObs.value,
        anexo: file ? file.name : null
    }

    console.log(ponto)
    saveRegisterLocalStorage(ponto)
    localStorage.setItem("lastTypeRegister", selectDialogTipo.value)
    localStorage.setItem("lastDateRegister", ponto.data)
    localStorage.setItem("lastTimeRegister", ponto.hora)

    dialogPonto.close()

    // Mostrar mensagem de confirmação
    popUp.className = "visible"

    setTimeout(() => {
        popUp.className = "not-visible"
    }, 5000);

})

diaSemana.textContent = getCurrentDay()
diaMesAno.textContent = getCurrentDate()
horaMinSeg.textContent = printHour()

function getCurrentDay() {
    const date = new Date()
    
    let days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
    return days[date.getDay()]

}

function getCurrentDate() {
    // Usar padSstart ou slice
    // Considerar formatos diferentes de data e hora conforme localização do usuário
    // Verificar se no Date há algum método que possa auxiliar
    // locale

    const date = new Date()

    let day = date.getDate()
    if (day < 10)
    {
        day = "0" + day
    }

    let month = String(parseInt(date.getMonth())+1)
    if (month.length < 2) {
        month = "0" + month
    } 

    return day + "/" + month + "/" + date.getFullYear()
}

function getCurrentHour() {
    const date = new Date()

    let hour = String(date.getHours()).padStart(2, '0')

    let minutes = String(date.getMinutes()).padStart(2, '0')

    let seconds = String(date.getSeconds()).padStart(2, '0')

    return hour + ":" + minutes + ":" + seconds
}

async function getCurrentPosition() {

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            let userLocation = {
                "latitude": position.coords.latitude,
                "longitude": position.coords.longitude
            }
            resolve(userLocation)
        },
        (error) => {
            reject("Erro ao recuperar a localização" + error)
        }
        )
    })

}

function saveRegisterLocalStorage(register) {

    registerLocalStorage.push(register)
    localStorage.setItem("register", JSON.stringify(registerLocalStorage))
}

function getRegisterLocalStorage(register) {
    
    let registers = JSON.parse(localStorage.getItem(register))

    if (!registers) {
        return []
    }

    return registers

}

function showInputData() {

    dialogDataInput.className = "visible" 
    dialogData.textContent = "Data: "

}

function showInputHora() {

    dialogHoraInput.className = "visible" 
    dialogHora.textContent = "Hora: "
    stopHourInterval()

}

function register() {
    
    dialogPonto.showModal()

    // Atualizar horário a cada segundo e data 00:00:00
    dialogData.textContent = "Data: " + getCurrentDate()
    dialogHora.textContent = "Hora: " + getCurrentHour()

    dialogDataInput.className = "not-visible" 
    dialogHoraInput.className = "not-visible" 

    inputDate = null; // Reseta a variável
    inputHour = null; // Reseta a variável

    startHourInterval()

    let lastTypeRegister = localStorage.getItem("lastTypeRegister")

    if (lastTypeRegister != null)
    {
        dialogUltimoPonto.textContent = `Último registro: ${lastTypeRegister} - ${localStorage.getItem("lastDateRegister")} - ${localStorage.getItem("lastTimeRegister")}`
    
        if (lastTypeRegister == "entrada")
        {
            selectDialogTipo.value = "intervalo"
        }
        else if (lastTypeRegister == "intervalo")
        {
            selectDialogTipo.value = "volta-intervalo"
        }
        else if (lastTypeRegister == "volta-intervalo")
        {
            selectDialogTipo.value = "saída"
        }
        else if (lastTypeRegister == "saída")
        {
            selectDialogTipo.value = "entrada"
        }

    }

}

// Deixar a data no formato dd/mm/yyyy
function formatDate(inputDate) {
    const parts = inputDate.split("-"); // Divide a data no formato yyyy-mm-dd
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // Retorna no formato dd/mm/yyyy
}

// Verificar se a data é no futuro
function isFutureDate(inputDate) {
    const parts = inputDate.split("/"); // Divide a data no formato dd/mm/yyyy
    const dateToCheck = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Cria um objeto Date no formato yyyy-mm-dd

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    return dateToCheck > today; // Retorna true se a data é no futuro
}

function printHour() {
    horaMinSeg.textContent = getCurrentHour()
}

function printHourDialog() {
    dialogHora.textContent = "Hora: " + getCurrentHour()
}

// Ativar e desativar intervalo de atualizar hora
function startHourInterval() {
    hourInterval = setInterval(printHourDialog, 1000);
}

function stopHourInterval() {
    clearInterval(hourInterval);
}

printHour()
setInterval(printHour, 1000)
