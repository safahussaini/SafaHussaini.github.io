const margin = { top: 50, right: 30, bottom: 50, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// ✅ Corrected path to match "data" folder
d3.csv("data/Career_Stats_Passing.csv").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    d["Passing Yards Per Game"] = +d["Passing Yards Per Game"];
  });

  // ✅ Filter out invalid rows
  const filtered = data.filter(d =>
    d.Year > 0 && !isNaN(d["Passing Yards Per Game"])
  );

  // ✅ Group by year and compute average passing yards per game
  const avgByYear = Array.from(
    d3.group(filtered, d => d.Year),
    ([year, records]) => ({
      year: +year,
      avgYards: d3.mean(records, r => r["Passing Yards Per Game"])
    })
  ).sort((a, b) => a.year - b.year);

  // ✅ Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(avgByYear, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(avgByYear, d => d.avgYards)]).nice()
    .range([height, 0]);

  // ✅ Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
    .call(d3.axisLeft(y));

  // ✅ Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.avgYards));

  // ✅ Draw the line
  svg.append("path")
    .datum(avgByYear)
    .attr("fill", "none")
    .attr("stroke", "darkgreen")
    .attr("stroke-width", 2)
    .attr("d", line);

  // ✅ Add label for latest season
  const latest = avgByYear[avgByYear.length - 1];
  svg.append("text")
    .attr("x", x(latest.year))
    .attr("y", y(latest.avgYards) - 10)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(`Latest: ${latest.year}, ${latest.avgYards.toFixed(1)} yds/game`);
});

// ======================
// Scene 2: Completion %
const svg2 = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/Career_Stats_Passing.csv").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    d["Completion Percentage"] = +d["Completion Percentage"];
  });

  const filtered = data.filter(d =>
    d.Year > 0 && !isNaN(d["Completion Percentage"])
  );

  const avgCompByYear = Array.from(
    d3.group(filtered, d => d.Year),
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

  const latest = avgCompByYear[avgCompByYear.length - 1];
  svg2.append("text")
    .attr("x", x2(latest.year))
    .attr("y", y2(latest.avgComp) - 10)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(`Latest: ${latest.year}, ${latest.avgComp.toFixed(1)}% Comp`);
});
