console.log("JS IS RUNNING");

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Set up SVG and margins for scatter plot
const svg_scatter = d3.select("svg#scatter-plot")
    .attr("width", 1050)
    .attr("height", 850);

const margin = { top: 40, right: 40, bottom: 80, left: 90 };
const width = +svg_scatter.attr("width") - margin.left - margin.right;
const height = +svg_scatter.attr("height") - margin.top - margin.bottom;

const chartGroup = svg_scatter.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let xScale, yScale;
let filter_gender = "no preference"; // Store current gender filter state
let filt_cluster = "no pref"; // Store current cluster filter state
let allMice = [];

// Tooltip setup for scatter plot
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

// Tooltip setup for line plot
const lineTooltip = d3.select("body")
    .append("div")
    .attr("id", "line-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "white")
    .style("padding", "4px 8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("display", "none");

// Generate time point keys (00:00, 00:10, ..., 23:50)
const timePoints = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 10) {
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        timePoints.push(time);
    }
}

// Load data and draw initial plot
d3.json("mice/mice.json").then(data => {
    allMice = data;
    drawScatter(data); // Default: all mice shown
    drawLinePlot([]); // Initialize empty line plot

    // Setup gender dropdown filter
    const genderSelect = document.querySelector("select#gender-select");
    if (genderSelect) {
        genderSelect.addEventListener("change", e => {
            filter_gender = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Setup cluster dropdown filter
    const clusterSelect = document.querySelector("select#cluster-select");
    if (clusterSelect) {
        clusterSelect.addEventListener("change", e => {
            filt_cluster = e.target.value.toLowerCase();
            applyFilters();
        });
    }
}).catch(error => {
    console.error("Error loading JSON:", error);
});

// Apply both filters based on current state
function applyFilters() {
    let filtered = allMice;

    // Apply gender filter
    if (filter_gender === "male") {
        filtered = filtered.filter(m => m.gender.toLowerCase() === "male");
    } else if (filter_gender === "female") {
        filtered = filtered.filter(m => m.gender.toLowerCase() === "female");
    }

    // Apply cluster filter
    if (filt_cluster === "night owl") {
        filtered = filtered.filter(m => m.cluster === "0");
    } else if (filt_cluster === "steady cruiser") {
        filtered = filtered.filter(m => m.cluster === "1");
    } else if (filt_cluster === "chaotic sprinter") {
        filtered = filtered.filter(m => m.cluster === "2");
    }

    drawScatter(filtered);
    drawAverage(filtered);
}

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
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("fill", "black")
        .text("Average Temperature (°C)");

    // Y axis with label
    chartGroup.append("g")
        .call(d3.axisLeft(yScale));

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("fill", "black")
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
                .html(`<strong>${d.name}</strong><br>Gender: ${d.gender}<br>Temp: ${d.avg_temp}<br>Act: ${d.avg_act}<br>Cluster: ${d.cluster}`);
        })
        .on('mouseleave', () => {
            tooltip.style("display", "none");
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

// Draw line plot for selected mice
function drawLinePlot(selectedData) {
    const svg = d3.select("svg#line-plot")
        .attr("width", 800)
        .attr("height", 400);

    // Clear previous plot
    svg.selectAll("*").remove();

    if (selectedData.length === 0) {
        svg.append("text")
            .attr("x", 400)
            .attr("y", 200)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .text("No mice selected");
        return;
    }

    // Log selected data for debugging
    console.log("Selected data:", selectedData);

    // Set up margins and dimensions
    const margin = { top: 60, right: 100, bottom: 80, left: 60 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Prepare activity data with error handling
    const activityData = selectedData.map(d => {
        const values = timePoints.map(t => {
            const value = +d[t];
            return isNaN(value) ? 0 : value; // Fallback to 0 for invalid values
        });
        console.log(`Activity values for ${d.name}:`, values); // Debug log
        return { ...d, activity: values };
    });

    // X scale (time of day, 144 points)
    const xScale = d3.scaleLinear()
        .domain([0, 143])
        .range([0, width]);

    // Y scale (activity level)
    const yMin = d3.min(activityData, d => d3.min(d.activity));
    const yMax = d3.max(activityData, d => d3.max(d.activity));
    console.log("Y scale domain:", [yMin, yMax]); // Debug log
    const yScale = d3.scaleLinear()
        .domain([Math.min(0, yMin), yMax]) // Include 0 if yMin is positive
        .range([height, 0])
        .nice();

    // Line generator
    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
        .defined(d => !isNaN(d)); // Skip NaN values

    // X axis (hourly ticks)
    const hours = d3.range(24); // 0 to 23
    const xAxis = d3.axisBottom(xScale)
        .tickValues(hours.map(h => h * 6)) // Every hour (6 intervals)
        .tickFormat(d => `${Math.floor(d / 6)}:00`);

    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .attr("text-anchor", "start")
        .attr("dx", "5px")
        .attr("dy", "10px");

    // X axis label
    chartGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text("Time of Day (10-min Intervals)");

    // Y axis
    chartGroup.append("g")
        .call(d3.axisLeft(yScale));

    // Y axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text("Activity Level");

    // Gridlines
    chartGroup.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""))
        .selectAll("line")
        .attr("stroke-opacity", 0.2);

    chartGroup.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""))
        .selectAll("line")
        .attr("stroke-opacity", 0.2);

    // Plot lines for each mouse
    const lines = chartGroup.selectAll(".line")
        .data(activityData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d => d.color_line)
        .attr("stroke-width", 2)
        .attr("d", d => line(d.activity))
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("stroke-width", 4); // Highlight line
            lineTooltip
                .style("display", "block")
                .html(`<strong>${d.name}</strong><br>Gender: ${d.gender}<br>Temp: ${d.avg_temp}<br>Act: ${d.avg_act}<br>Cluster: ${d.cluster}`);
        })
        .on("mousemove", event => {
            lineTooltip
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("stroke-width", 2); // Reset line
            lineTooltip.style("display", "none");
        });

    // Title
    chartGroup.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .text("Average Activity of Selected Mice Over a Day (10-min Intervals)");

    // Legend
    const legend = chartGroup.append("g")
        .attr("transform", `translate(${width + 10}, 0)`);

    activityData.forEach((d, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d.color_line);

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .attr("font-size", "12px")
            .attr("fill", "black")
            .text(d.name);
    });
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
    drawLinePlot(selectedData); // Draw line plot for selected mice
}

function isMouseSelected(selection, data) {
    if (!selection) return false;
    const [[x0, y0], [x1, y1]] = selection;
    const x = xScale(+data.avg_temp);
    const y = yScale(+data.avg_act);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function selectedMiceText(selection) {
    const selectedIDs = selection.map(d => d.name); // Collect ID of selected mouse

    // Update text
    const selectedDiv = d3.select("div#text-info");
    // Clear previous text
    selectedDiv.selectAll("p").remove();

    // Append updated info
    selectedDiv.append("p")
        .text(`Number selected: ${selection.length || 0}`);
    selectedDiv.append("p")
        .text(`Selected names: ${selectedIDs.length > 0 ? selectedIDs.join(", ") : "None"}`);
}

function drawAverage(data) {
    // Placeholder for average plot
}