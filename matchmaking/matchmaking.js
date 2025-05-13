console.log("JS IS RUNNING");

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Set up SVG and margins
const svg_scatter = d3.select("svg#scatter-plot")
    .attr("width", 1000)
    .attr("height", 800);

const margin = { top: 40, right: 40, bottom: 60, left: 70 };
const width = +svg_scatter.attr("width") - margin.left - margin.right;
const height = +svg_scatter.attr("height") - margin.top - margin.bottom;

const chartGroup = svg_scatter.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let xScale, yScale;

// Tooltip setup
const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "white")
    .style("padding", "4px 8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("display", "none");

let allMice = [];

// Load data and draw initial plot
d3.json("mice/mice.json").then(data => {
    allMice = data;
    drawScatter(data); // default = all mice shown

    // Setup gender dropdown filter
    const genderSelect = document.querySelector("select#gender-select");
    if (genderSelect) {
        genderSelect.addEventListener("change", e => {
            const selected = e.target.value.toLowerCase();
            let filtered = allMice;

            if (selected === "male") {
                filtered = allMice.filter(m => m.gender.toLowerCase() === "male");
            } else if (selected === "female") {
                filtered = allMice.filter(m => m.gender.toLowerCase() === "female");
            }

            drawScatter(filtered);
            drawAverage(filtered);
        });
    }
});

// Draw scatterplot with gridlines, tooltip, and axis labels
function drawScatter(data) {
    chartGroup.selectAll("*").remove(); // Clear previous plot

    xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.avg_temp))
        .range([0, width])
        .nice();


    yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.avg_act))
        .range([height, 0])
        .nice();

    // X gridlines
    chartGroup.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""))
        .selectAll("line")
        .attr("stroke-opacity", 0.2);

    // Y gridlines
    chartGroup.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""))
        .selectAll("line")
        .attr("stroke-opacity", 0.2);

    // X axis with label
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    chartGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Average Temperature (°C)");

    // Y axis with label
    chartGroup.append("g")
        .call(d3.axisLeft(yScale));

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Average Activity Level");

    // Data points
    const dots = chartGroup.append('g').attr('class', 'dots');
    dots.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(+d.avg_temp))
        .attr("cy", d => yScale(+d.avg_act))
        .attr("r", 6)
        .attr("fill", d => d.color)
        .attr("stroke", "black")
        .on("mousemove", event => {
            tooltip
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 20 + "px");
        })
        .on('mouseenter', (event, d) => {
            tooltip
                .style("display", "block")
                .html(`<strong>${d.name}</strong><br>Gender: ${d.gender}<br>Temp: ${d.avg_temp}<br>Act: ${d.avg_act}`);
        })
        .on('mouseleave', (event) => {
            tooltip.style("display", "none")
        });

    // Mouse name labels
    chartGroup.selectAll("text.label")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(+d.avg_temp))
        .attr("y", d => yScale(+d.avg_act) - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.name);

    // Create brush with event handlers
    chartGroup.call(d3.brush().on('start brush end', brushed));

    // Raise dots and everything after overlay
    chartGroup.selectAll('.dots, .overlay ~ *').raise();
}

// Setting up the brush
function createBrushSelector(svg) {
    svg.call(d3.brush());
}

// Making brush to actually select dots
function brushed(event) {
    const selection = event.selection;
    const selectedData = [];

    chartGroup.selectAll('circle')
        .classed('selected', function(d) {
            const selected = isMouseSelected(selection, d);
            if (selected) selectedData.push(d);
            return selected;
        });
    
    selectedMiceText(selectedData);
}


function isMouseSelected(selection, data) {
    if (!selection) return false;
    const [[x0, y0], [x1, y1]] = selection;
    const x = xScale(+data.avg_temp);
    const y = yScale(+data.avg_act);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function selectedMiceText(selection) {
    const selected_p = d3.select("p#selected")
    selected_p.text(`number selected: ${selection.length || "ZERO"}`)
}

function drawAverage(data){

}