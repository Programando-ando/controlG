var tPresupuesto = parseInt(localStorage.getItem("presupuesto")) || 0;
var gastos = JSON.parse(localStorage.getItem("gastos")) || [];

var divPresupuesto = document.querySelector('#divPresupuesto');
var presupuesto = document.querySelector('#presupuesto');
var btnpresupuesto = document.querySelector('#btnPresupuesto');
var divGastos = document.querySelector('#divGastos');
var totalPresupuesto = document.querySelector("#totalPresupuesto");
var totalGastado = document.querySelector("#totalGastos");
var totalDisponible = document.querySelector("#totalDisponible");
var progress = document.querySelector("#progress"); 
var tGastos = 0;
var disponible = 0;

const inicio = () => {
    if (tPresupuesto > 0) {
        divPresupuesto.classList.remove("d-block");
        divGastos.classList.remove("d-none");
        divPresupuesto.classList.add("d-none");
        divGastos.classList.add("d-block");
        totalPresupuesto.innerHTML = `$ ${tPresupuesto.toFixed(2)}`;
        mostrarGastos();
    } else {
        divPresupuesto.classList.remove("d-none");
        divGastos.classList.remove("d-block");
        divPresupuesto.classList.add("d-block");
        divGastos.classList.add("d-none");
        presupuesto.value = 0;
    }
};

btnpresupuesto.onclick = () => {
    tPresupuesto = parseInt(presupuesto.value);
    if (tPresupuesto <= 0) {
        Swal.fire({title: "ERROR!", text: "PRESUPUESTO MAYOR A 0", icon: "error"});
        return;
    }
    
    localStorage.setItem('presupuesto', tPresupuesto);
    divPresupuesto.classList.remove("d-block");
    divGastos.classList.remove("d-none");
    divPresupuesto.classList.add("d-none");
    divGastos.classList.add("d-block");

    updateProgress(100);
    mostrarGastos();
};

const guardarGasto = () => {
    let descripcion = document.querySelector("#descripcion").value;
    let costo = parseFloat(document.querySelector("#costo").value);
    let categoria = document.querySelector("#categoria").value;

    if (descripcion.trim() === "" || isNaN(costo) || costo <= 0) {
        Swal.fire({title: "ERROR!", text: "Completa los campos correctamente", icon: "error"});
        return;
    }

    if (costo > disponible) {
        Swal.fire({title: "ERROR!", text: "No hay suficiente dinero", icon: "error"});
        return;
    }

    let gastoExistente = gastos.find(gasto => gasto.descripcion === descripcion && gasto.categoria === categoria);
    if (gastoExistente) {
        gastoExistente.costo = costo;
    } else {
        const gasto = { descripcion, costo, categoria };
        gastos.push(gasto);
    }

    localStorage.setItem("gastos", JSON.stringify(gastos));
    mostrarGastos();
    document.querySelector("#descripcion").value = "";
    document.querySelector("#costo").value = "";
    document.querySelector("#categoria").value = "comida";
};

const calcularTotalGastado = (gastosFiltrados) => {
    return gastosFiltrados.reduce((total, gasto) => total + parseFloat(gasto.costo), 0);
};

const updateProgress = (percentage) => {
    progress.value = percentage;
    progress.setAttribute('value', percentage);
};

const mostrarGastos = (filtroCategoria = 'todos') => {
    gastos = JSON.parse(localStorage.getItem("gastos")) || [];
    let gastosFiltrados = gastos;
    tGastos = 0;

    if (filtroCategoria !== 'todos') {
        gastosFiltrados = gastos.filter(gasto => gasto.categoria === filtroCategoria);
    }

    let totalGastadoMonto = calcularTotalGastado(gastosFiltrados);
    let porcentajeGastado = (totalGastadoMonto / tPresupuesto) * 100;
    let totalDisponibleMonto = tPresupuesto - totalGastadoMonto;

    totalGastado.innerHTML = `$ ${totalGastadoMonto.toFixed(2)}`;
    totalDisponible.innerHTML = `$ ${totalDisponibleMonto.toFixed(2)}`;
    updateProgress(100 - porcentajeGastado); 

    let gastosHTML = '';
    if (gastosFiltrados.length == 0) {
        gastosHTML = `<b>NO HAY GASTOS DISPONIBLES</b>`;
    } else {
        let index = 0;
        gastosFiltrados.forEach(gasto => {
            gastosHTML += `
                <div class="card text-center w-50 m-auto mt-3 shadow p-2">
                    <div class="row">
                        <div class="col"><br><img src="/img/${gasto.categoria}.png" alt="Sin imagen" class="imgCategoria"></div>
                        <div class="col text-start">
                            <p><b>Descripcion:</b><small> ${gasto.descripcion}</small></p>
                            <p><b>Costo:</b><small>$ ${parseFloat(gasto.costo).toFixed(2)}</small></p>
                        </div>
                        <div class="col">
                            <button class="btn btn-danger" onclick="eliminarG(${index})">Delete <i class="bi bi-trash2-fill"></i></button>
                            <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#editarGasto" onclick="mostarG(${index})">Update <i class="bi bi-pencil"></i></button>
                        </div>
                    </div>  
                </div>`;
            tGastos += parseFloat(gasto.costo);
            index++;
        });
    }

    document.getElementById("listaGasto").innerHTML = gastosHTML;
    pintarDatos();
};

document.querySelector("#filtrarCategoria").addEventListener("change", (e) => {
    mostrarGastos(e.target.value);
});

function eliminarG(index) {
    Swal.fire({
        title: "¿Estás seguro de eliminar este gasto?",
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: "No"
    }).then((result) => {
        if (result.isConfirmed) {
            gastos.splice(index, 1);
            localStorage.setItem("gastos", JSON.stringify(gastos));
            Swal.fire("El Producto se eliminó exitosamente", "", "success");
            mostrarGastos();
        }
    });
}

var indiceGasto;
function mostarG(index) {
    indiceGasto = index;
    var gastoo = gastos[index];

    document.querySelector("#edescripcion").value = gastoo.descripcion;
    document.querySelector("#ecosto").value = gastoo.costo;
    document.querySelector("#ecategoria").value = gastoo.categoria;
}

var actualizarG = document.getElementById("actualizar");

actualizarG.onclick = () => {
    let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
    let gasto = gastos[indiceGasto];

    gasto.descripcion = document.getElementById("edescripcion").value;
    gasto.costo = parseFloat(document.getElementById("ecosto").value);
    gasto.categoria = document.getElementById("ecategoria").value;

    if (isNaN(gasto.costo) || gasto.costo <= 0) {
        Swal.fire({title: "ERROR!", text: "El costo debe ser un número mayor a 0", icon: "error"});
        return;
    }

    localStorage.setItem("gastos", JSON.stringify(gastos));
    mostrarGastos();
};

const pintarDatos = () => {
    let totalPresupuesto = document.querySelector("#totalPresupuesto");
    let totalDisponible = document.querySelector("#totalDisponible");
    let totalGastos = document.querySelector("#totalGastos");
    var tPresupuesto = parseInt(localStorage.getItem("presupuesto"));
    disponible = tPresupuesto - tGastos;
    totalGastos.innerHTML = `$${tGastos.toFixed(2)}`;
    totalPresupuesto.innerHTML = `$ ${tPresupuesto.toFixed(2)}`;
    totalDisponible.innerHTML = `$ ${disponible.toFixed(2)}`;
}

const reset = () => {
    localStorage.clear();
    window.location.reload();
};

inicio();
