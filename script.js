// 🔘 Show/hide scenes
window.showScene = function(sceneId) {
  document.getElementById("scene1").style.display = sceneId === "scene1" ? "block" : "none";
  document.getElementById("scene2").style.display = sceneId === "scene2" ? "block" : "none";
  document.getElementById("scene3").style.display = sceneId === "scene3" ? "block" : "none";
};

// 🎯 Common setup
const margin = { top: 50, right: 30, bottom: 60, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// 🎯 Load data once and draw all scenes
d3.csv("data/Career_Stats_Passing.csv").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    d["Passing Yards Per Game"] = +d["Passing Yards Per Game"];
    d["Completion Percentage"] = +d["Completion Percentage"];
  });

  // =========================
  // 🎬 Scene 1: Passing Yards
  // =========================
  const svg1 = d3.select("#scene1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgYardsByYear = Array.from(
    d3.group(data.filter(d => !isNaN(d["Passing Yards Per Game"])), d => d.Year),
    ([year, records]) => ({
      year: +year,
      avgYards: d3.mean(records, r => r["Passing Yards Per Game"])
    })
  ).sort((a, b) => a.year - b.year);

  const x1 = d3.scaleLinear().domain(d3.extent(avgYardsByYear, d => d.year)).range([0, width]);
  const y1 = d3.scaleLinear().domain([0, d3.max(avgYardsByYear, d => d.avgYards)]).nice().range([height, 0]);

  svg1.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x1).tickFormat(d3.format("d")));
  svg1.append("g").call(d3.axisLeft(y1));

  const line1 = d3.line().x(d => x1(d.year)).y(d => y1(d.avgYards));
  svg1.append("path").datum(avgYardsByYear).attr("fill", "none").attr("stroke", "darkgreen").attr("stroke-width", 2).attr("d", line1);

  svg1.append("text")
    .attr("x", x1(avgYardsByYear.at(-1).year))
    .attr("y", y1(avgYardsByYear.at(-1).avgYards) - 10)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(`Latest: ${avgYardsByYear.at(-1).year}, ${avgYardsByYear.at(-1).avgYards.toFixed(1)} yds/game`);

  // ===============================
  // 🎬 Scene 2: Completion %
  // ===============================
  const svg2 = d3.select("#scene2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgCompByYear = Array.from(
    d3.group(data.filter(d => !isNaN(d["Completion Percentage"])), d => d.Year),
    ([year, records]) => ({
      year: +year,
      avgComp: d3.mean(records, r => r["Completion Percentage"])
    })
  ).sort((a, b) => a.year - b.year);

  const x2 = d3.scaleLinear().domain(d3.extent(avgCompByYear, d => d.year)).range([0, width]);
  const y2 = d3.scaleLinear().domain([0, d3.max(avgCompByYear, d => d.avgComp)]).nice().range([height, 0]);

  svg2.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x2).tickFormat(d3.format("d")));
  svg2.append("g").call(d3.axisLeft(y2));

  const line2 = d3.line().x(d => x2(d.year)).y(d => y2(d.avgComp));
  svg2.append("path").datum(avgCompByYear).attr("fill", "none").attr("stroke", "steelblue").attr("stroke-width", 2).attr("d", line2);

  svg2.append("text")
    .attr("x", x2(avgCompByYear.at(-1).year))
    .attr("y", y2(avgCompByYear.at(-1).avgComp) - 10)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(`Latest: ${avgCompByYear.at(-1).year}, ${avgCompByYear.at(-1).avgComp.toFixed(1)}% comp`);

  // ===============================
  // 🎬 Scene 3: Explore by Year
  // ===============================
  const container3 = d3.select("#scene3");
  container3.append("h2").text("Explore Passing Yards Per Game by Season");

  const yearSelect = container3.append("select").attr("id", "yearDropdown");

  const svg3 = container3.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const years = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => a - b);
  yearSelect.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  function updateScene3(selectedYear) {
    const filtered = data.filter(d =>
      d.Year === +selectedYear && !isNaN(d["Passing Yards Per Game"])
    );

    const topPlayers = filtered.sort((a, b) =>
      b["Passing Yards Per Game"] - a["Passing Yards Per Game"]
    ).slice(0, 20);

    svg3.selectAll("*").remove();

    const x = d3.scaleBand()
      .domain(topPlayers.map(d => d.Name))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(topPlayers, d => d["Passing Yards Per Game"])]).nice()
      .range([height, 0]);

    svg3.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(name => name.split(" ")[1] || name))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg3.append("g").call(d3.axisLeft(y));

    svg3.selectAll("rect")
      .data(topPlayers)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Name))
      .attr("y", d => y(d["Passing Yards Per Game"]))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d["Passing Yards Per Game"]))
      .attr("fill", "orange");

    svg3.selectAll("text.bar-label")
      .data(topPlayers)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.Name) + x.bandwidth() / 2)
      .attr("y", d => y(d["Passing Yards Per Game"]) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .text(d => d["Passing Yards Per Game"].toFixed(1));
  }

  updateScene3(years.at(-1)); // default latest year

  yearSelect.on("change", function () {
    updateScene3(this.value);
  });
});
