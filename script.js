// Toggle scenes
window.showScene = function (sceneId) {
  document.getElementById("scene1").style.display = sceneId === "scene1" ? "block" : "none";
  document.getElementById("scene2").style.display = sceneId === "scene2" ? "block" : "none";
  document.getElementById("scene3").style.display = sceneId === "scene3" ? "block" : "none";
};

const margin = { top: 50, right: 30, bottom: 100, left: 60 },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

d3.csv("data/Career_Stats_Passing.csv").then(data => {
  data.forEach(d => {
    for (let key in d) {
      const cleanKey = key.trim();
      if (cleanKey !== key) {
        d[cleanKey] = d[key];
        delete d[key];
      }
    }
    d.Year = +d.Year;
    d["Passing Yards Per Game"] = +d["Passing Yards Per Game"] || 0;
    d["Completion Percentage"] = +d["Completion Percentage"] || 0;
    d["TD Passes"] = +d["TD Passes"] || 0;
    d.Ints = +d.Ints || 0;
  });

  const filteredData = data.filter(d => d.Year >= 1931 && d.Year <= 2016);

  // Scene 1 - Passing Yards Over Time
  const svg1 = d3.select("#scene1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgYards = Array.from(
    d3.group(filteredData.filter(d => d["Passing Yards Per Game"] > 0), d => d.Year),
    ([year, records]) => ({
      year: +year,
      avgYards: d3.mean(records, r => r["Passing Yards Per Game"])
    })
  ).sort((a, b) => a.year - b.year);

  const x1 = d3.scaleLinear().domain(d3.extent(avgYards, d => d.year)).range([0, width]);
  const y1 = d3.scaleLinear().domain([0, d3.max(avgYards, d => d.avgYards)]).nice().range([height, 0]);

  svg1.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x1).tickFormat(d3.format("d")));
  svg1.append("g").call(d3.axisLeft(y1));

  const line1 = d3.line().x(d => x1(d.year)).y(d => y1(d.avgYards));
  svg1.append("path").datum(avgYards).attr("fill", "none").attr("stroke", "darkgreen").attr("stroke-width", 2).attr("d", line1);

  svg1.append("text")
    .attr("x", x1(avgYards.at(-1).year))
    .attr("y", y1(avgYards.at(-1).avgYards) - 10)
    .attr("text-anchor", "end")
    .text(`Latest: ${avgYards.at(-1).year}, ${avgYards.at(-1).avgYards.toFixed(1)} yds/game`);

  // Scene 2 - Completion %
  const svg2 = d3.select("#scene2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgComp = Array.from(
    d3.group(filteredData.filter(d => d["Completion Percentage"] > 0), d => d.Year),
    ([year, records]) => ({
      year: +year,
      avgComp: d3.mean(records, r => r["Completion Percentage"])
    })
  ).sort((a, b) => a.year - b.year);

  const x2 = d3.scaleLinear().domain(d3.extent(avgComp, d => d.year)).range([0, width]);
  const y2 = d3.scaleLinear().domain([0, d3.max(avgComp, d => d.avgComp)]).nice().range([height, 0]);

  svg2.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x2).tickFormat(d3.format("d")));
  svg2.append("g").call(d3.axisLeft(y2));

  const line2 = d3.line().x(d => x2(d.year)).y(d => y2(d.avgComp));
  svg2.append("path").datum(avgComp).attr("fill", "none").attr("stroke", "steelblue").attr("stroke-width", 2).attr("d", line2);

  svg2.append("text")
    .attr("x", x2(avgComp.at(-1).year))
    .attr("y", y2(avgComp.at(-1).avgComp) - 10)
    .attr("text-anchor", "end")
    .text(`Latest: ${avgComp.at(-1).year}, ${avgComp.at(-1).avgComp.toFixed(1)}%`);

  // Scene 3 - Top QBs by Year
  const container3 = d3.select("#scene3");
  container3.append("h2").text("Explore Top QBs by Yards/Game");

  const yearSelect = container3.append("select").attr("id", "yearDropdown");

  const svg3 = container3.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const years = Array.from(new Set(filteredData.map(d => d.Year))).sort((a, b) => a - b);
  yearSelect.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  function updateScene3(selectedYear) {
    const filtered = filteredData.filter(d =>
      d.Year === +selectedYear && d["Passing Yards Per Game"] > 0
    );

    const topPlayers = filtered.sort((a, b) =>
      b["Passing Yards Per Game"] - a["Passing Yards Per Game"]
    ).slice(0, 15);

    topPlayers.forEach(d => {
      const [last, first] = d.Name.split(", ");
      d.FullName = `${first} ${last}`;
    });

    svg3.selectAll("*").remove();

    svg3.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .text(`Top QBs – ${selectedYear}`);

    const x = d3.scaleBand()
      .domain(topPlayers.map(d => d.FullName))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(topPlayers, d => d["Passing Yards Per Game"])]).nice()
      .range([height, 0]);

    svg3.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    svg3.append("g").call(d3.axisLeft(y));

    svg3.selectAll("rect")
      .data(topPlayers)
      .enter()
      .append("rect")
      .attr("x", d => x(d.FullName))
      .attr("y", d => y(d["Passing Yards Per Game"]))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d["Passing Yards Per Game"]))
      .attr("fill", "orange")
      .append("title")
      .text(d => `${d.FullName} – ${d["Passing Yards Per Game"].toFixed(1)} yds`);

    const top = topPlayers[0];
    svg3.append("text")
      .attr("x", x(top.FullName) + x.bandwidth() / 2)
      .attr("y", y(top["Passing Yards Per Game"]) - 10)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(`Top: ${top.FullName}`);
  }

  updateScene3(years.at(-1));
  yearSelect.on("change", function () {
    updateScene3(this.value);
  });
});
