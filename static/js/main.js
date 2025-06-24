// Dimensiones del SVG
const width = 960;
const height = 600;

// Crear el SVG dentro del div #mapa
const svg = d3.select("#mapa")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Tooltip flotante
const tooltip = d3.select("#tooltip");

// Proyección geográfica y generador de rutas
const projection = d3.geoMercator()
    .center([-74, 4.5]) // Centro aproximado de Colombia
    .scale(2200)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Cargar los datos GeoJSON del mapa y los accesos por departamento
Promise.all([
    d3.json("/static/data/colombia_departamentos.geojson"),
    d3.json("/static/data/accesos_departamento.json")
]).then(([geoData, accesosData]) => {
    // Crear un diccionario de accesos por nombre de departamento
    const accesoPorDepartamento = {};
    accesosData.forEach(d => {
        accesoPorDepartamento[d.departamento] = +d.accesos;
    });

    // Escala de color
    const colorScale = d3.scaleSequential()
        .domain(d3.extent(accesosData, d => d.accesos))
        .interpolator(d3.interpolateBlues);

    // Dibujar los departamentos
    svg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
            const nombre = d.properties.NOMBRE_DPT;
            const accesos = accesoPorDepartamento[nombre];
            return accesos ? colorScale(accesos) : "#ccc";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function (event, d) {
            const nombre = d.properties.NOMBRE_DPT;
            const accesos = accesoPorDepartamento[nombre] || 0;
            tooltip.style("visibility", "visible")
                .html(`<strong>${nombre}</strong><br>Accesos: ${accesos.toLocaleString()}`);
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY + 10) + "px")
                   .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        })
        .on("click", function (event, d) {
            const nombre = d.properties.NOMBRE_DPT;
            const accesos = accesoPorDepartamento[nombre] || 0;

            d3.select("#tituloDepartamento").text(nombre);
            d3.select("#contenidoModal").html(`
                <p><strong>Accesos fijos:</strong> ${accesos.toLocaleString()}</p>
                <div id="grafico"></div>
            `);

            // Datos simulados: fijo vs móvil
            const datos = [accesos, accesos * 0.6]; // Simula móvil como 60% del fijo
            const labels = ["Fijo", "Móvil"];

            const ancho = 300, alto = 200;
            const escala = d3.scaleLinear().domain([0, d3.max(datos)]).range([0, alto - 30]);

            const contenedor = d3.select("#grafico")
                .html("")
                .append("svg")
                .attr("width", ancho)
                .attr("height", alto);

            contenedor.selectAll("rect")
                .data(datos)
                .enter()
                .append("rect")
                .attr("x", (d, i) => i * 80 + 50)
                .attr("y", d => alto - escala(d))
                .attr("width", 40)
                .attr("height", d => escala(d))
                .attr("fill", "#4A90E2");

            contenedor.selectAll("text")
                .data(datos)
                .enter()
                .append("text")
                .attr("x", (d, i) => i * 80 + 70)
                .attr("y", d => alto - escala(d) - 10)
                .attr("text-anchor", "middle")
                .text(d => d.toLocaleString());

            contenedor.selectAll("label")
                .data(labels)
                .enter()
                .append("text")
                .attr("x", (d, i) => i * 80 + 70)
                .attr("y", alto - 5)
                .attr("text-anchor", "middle")
                .text(d => d);

            d3.select("#modal").style("display", "flex");
        });

}).catch(error => {
    console.error("Error cargando los datos:", error);
});


// Asegurar que el botón se asigne después de que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    const cerrarBtn = document.getElementById("cerrarModal");
    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", () => {
            d3.select("#modal").style("display", "none");
        });
    }
});

// Esperar a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    const cerrarBtn = document.getElementById("cerrarModal");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");

    if (cerrarBtn && modal) {
        cerrarBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // Cerrar el modal al hacer clic fuera del contenido
    if (modal && modalContent) {
        modal.addEventListener("click", (e) => {
            if (!modalContent.contains(e.target)) {
                modal.style.display = "none";
            }
        });
    }
});
