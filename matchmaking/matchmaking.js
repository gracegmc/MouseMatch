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
            drawAverage(filered);
        });
    }
});

// Draw scatterplot with gridlines, tooltip, and axis labels
function drawScatter(data) {
    chartGroup.selectAll("*").remove(); // Clear previous plot

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.avg_temp))
        .range([0, width])
        .nice();

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.avg_act))
        .range([height, 0])
        .nice();

    // X gridlines
    chartGroup.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(-height).tickFormat(""))
        .selectAll("line")
        .attr("stroke-opacity", 0.2);

    // Y gridlines
    chartGroup.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(""))
        .selectAll("line")
        .attr("stroke-opacity", 0.2);

    // X axis with label
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    chartGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Average Temperature (°C)");

    // Y axis with label
    chartGroup.append("g")
        .call(d3.axisLeft(y));

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
        .attr("cx", d => x(+d.avg_temp))
        .attr("cy", d => y(+d.avg_act))
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
        .attr("x", d => x(+d.avg_temp))
        .attr("y", d => y(+d.avg_act) - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.name);

    // Create brush with event handlers
    chartGroup.call(d3.brush().on('start brush end', brushed));

    // Raise dots and everything after overlay
    chartGroup.selectAll('.dots, .overlay ~ *').raise();
}

// Setting up the brush
const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("end", brushed);

chartGroup.append("g")
    .attr("class", "brush")
    .call(brush);

function brushed(event) {
const selection = event.selection;
if (!selection) return;
console.log(selection)
const [[x0, y0], [x1, y1]] = selection;

// Filter data based on the brush selection
const filteredData = allMice.filter(d => {
    const tempX = x(d.avg_temp);
    const tempY = y(d.avg_act);
    return tempX >= x0 && tempX <= x1 && tempY >= y0 && tempY <= y1;
});

// Clear the brush selection
chartGroup.select(".brush").call(brush.move, null);

// Update visualization with filtered data
drawScatter(filteredData);
}


function isMiceSelected(selection, mice) {
    // Return true if commit is within brushSelection
    // and false if not
    if (!selection) { 
        return false; } 
    console.log(selection)
    return selection; 
  }

function drawAverage(data){

}