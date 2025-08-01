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
