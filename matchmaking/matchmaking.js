console.log("JS IS RUNNING");


//import { fetchJSON, renderMice } from '../global.js';
//const mice = await fetchJSON('./mice/mice.json');
//const miceContainer = document.querySelector('.mice');
//renderMice(mice, container, 'h2');


const form = document.querySelector('form');

form?.addEventListener('submit', function(event) {
    event.preventDefault();

    // store data of form here
    const data = new FormData(this);

    //get the mailto part of the url
    let url = this.action + '?';

    for (let [name, value] of data) {
        url += `${name}=${encodeURIComponent(value)}&`
    }

    location.href = url.slice(0, -1);
});

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// matchmaking.js
// Select the SVG container (add this to your matchmaking.html: <svg id="scatter-plot"></svg>)
const svg = d3.select("#scatter-plot")
    .attr("width", 600)
    .attr("height", 400)
    .attr("style", "border: 1px solid black;");

const margin = { top: 20, right: 20, bottom: 50, left: 50 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load and parse the JSON data
d3.json("mice/mice.json").then(data => {
    // Define scales
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.avg_temp) - 1, d3.max(data, d => d.avg_temp) + 1])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.avg_act) - 1, d3.max(data, d => d.avg_act) + 1])
        .range([height, 0]);

    // Add x-axis
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Average Temperature (°C)");

    // Add y-axis
    g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Average Activity Level");

    // Add scatter plot points
    g.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.avg_temp))
        .attr("cy", d => yScale(d.avg_act))
        .attr("r", 5)
        .attr("fill", d => d.color) // Single color as requested
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`Name: ${d.name}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });

    // Add title
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Temp vs. Average Activity Level For Each Mouse");

    // Add grid (optional, for better readability)
    g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickSize(-height)
            .tickFormat(""))
        .selectAll(".tick")
        .attr("opacity", 0.3);

    g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat(""))
        .selectAll(".tick")
        .attr("opacity", 0.3);
}).catch(error => console.log(error));

// Tooltip setup (add this to your matchmaking.html)
const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px");