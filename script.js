// 🔘 Button Trigger Logic
window.showScene = function(sceneId) {
  document.getElementById("scene1").style.display = sceneId === "scene1" ? "block" : "none";
  document.getElementById("scene2").style.display = sceneId === "scene2" ? "block" : "none";
};

// 🧱 Chart dimensions
const margin = { top: 50, right: 30, bottom: 50, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// 📊 Load CSV once, then render both scenes
d3.csv("data/Career_Stats_Passing.csv").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    d["Passing Yards Per Game"] = +d["Passing Yards Per Game"];
    d["Completion Percentage"] = +d["Completion Percentage"];
  });

  // ✅ Scene 1: Passing Yards
  const svg1 = d3.select("#scene1")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const filtered1 = data.filter(d => !isNaN(d["Passing Yards Per Game"]));
  const avgYardsByYear = Array.from(
    d3.group(filtered1, d => d.Year),
    ([year, records]) => ({
      year: +year,
      avgYards: d3.mean(records, r => r["Passing Yards Per Game"])
    })
  ).sort((a, b) => a.year - b.year);

  const x1 = d3.scaleLinear()
    .domain(d3.extent(avgYardsByYear, d => d.year))
    .range([0, width]);

  const y1 = d3.scaleLinear()
    .domain([0, d3.max(avgYardsByYear, d => d.avgYards)]).nice()
    .range([height, 0]);

  svg1.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x1).tickFormat(d3.format("d")));

  svg1.append("g")
    .call(d3.axisLeft(y1));

  const line1 = d3.line()
    .x(d => x1(d.year))
    .y(d => y1(d.avgYards));

  svg1.append("path")
    .datum(avgYardsByYear)
    .attr("fill", "none")
    .attr("stroke", "darkgreen")
    .attr("stroke-width", 2)
    .attr("d", line1);

  const latest1 = avgYardsByYear[avgYardsByYear.length - 1];
  svg1.append("text")
    .attr("x", x1(latest1.year))
    .attr("y", y1(latest1.avgYards) - 10)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(`Latest: ${latest1.year}, ${latest1.avgYards.toFixed(1)} yds/game`);

  // ✅ Scene 2: Completion %
  const svg2 = d3.select("#scene2")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const filtered2 = data.filter(d => !isNaN(d["Completion Percentage"]));
  const avgCompByYear = Array.from(
    d3.group(filtered2, d => d.Year),
    ([year, records]) => ({
      year: +year,
      avgComp: d3.mean(records, r => r["Completion Percentage"])
    })
  ).sort((a, b) => a.year - b.year);

  const x2 = d3.scaleLinear()
    .domain(d3.extent(avgCompByYear, d => d.year))
    .range([0, width]);

  const y2 = d3.scaleLinear()
    .domain([0, d3.max(avgCompByYear, d => d.avgComp)]).nice()
    .range([height, 0]);

  svg2.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x2).tickFormat(d3.format("d")));

  svg2.append("g")
    .call(d3.axisLeft(y2));

  const line2 = d3.line()
    .x(d => x2(d.year))
    .y(d => y2(d.avgComp));

  svg2.append("path")
    .datum(avgCompByYear)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line2);

  const latest2 = avgCompByYear[avgCompByYear.length - 1];
  svg2.append("text")
    .attr("x", x2(latest2.year))
    .attr("y", y2(latest2.avgComp) - 10)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(`Latest: ${latest2.year}, ${latest2.avgComp.toFixed(1)}% comp`);
});
