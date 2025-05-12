import { fetchJSON, renderMice } from '../global.js';
const mice = await fetchJSON('./mice/mice.json');
const miceContainer = document.querySelector('.mice');
renderMice(mice, container, 'h2');


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

const width = 600;
const height = 400;
const margin = { top: 40, right: 40, bottom: 50, left: 60 };

const svg = d3.select("svg#scatterplot")
  .attr("width", width)
  .attr("height", height);

const plotArea = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

d3.json("mice/mice.json").then(data => {
    console.log("DATA:", data);
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.avg_temp))
    .range([0, innerWidth])
    .nice();

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.avg_act))
    .range([innerHeight, 0])
    .nice();

  plotArea.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).ticks(6))
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", 35)
    .attr("fill", "black")
    .text("Average Temperature (°C)");

  plotArea.append("g")
    .call(d3.axisLeft(y).ticks(6))
    .append("text")
    .attr("x", -innerHeight / 2)
    .attr("y", -40)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Average Activity Level");

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid gray")
    .style("padding", "4px 8px")
    .style("display", "none");

  plotArea.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.avg_temp))
    .attr("cy", d => y(d.avg_act))
    .attr("r", 6)
    .attr("fill", d => d.color || "steelblue")
    .attr("stroke", "black")
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .html(`<strong>${d.mouse_id}</strong><br>Temp: ${d.avg_temp}<br>Act: ${d.avg_act}`);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => tooltip.style("display", "none"));
});


