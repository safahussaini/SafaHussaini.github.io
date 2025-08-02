// 🎯 Toggle scenes via buttons
window.showScene = function (sceneId) {
  document.getElementById("scene1").style.display = sceneId === "scene1" ? "block" : "none";
  document.getElementById("scene2").style.display = sceneId === "scene2" ? "block" : "none";
  document.getElementById("scene3").style.display = sceneId === "scene3" ? "block" : "none";
};

// 📐 Chart layout
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

  // Scene 1: Average Passing Yards Per Game
  const svg1 = d3.select("#scene1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const avgYardsByYear = Array.from(
    d3.group(data.filter(d => d["Passing Yards Per Game"] > 0), d => d.Year),
    ([year, records]) => ({ year: +year, avgYards: d3.mean(records, r => r["Passing Yards Per Game"]) })
  ).sort((a, b) => a.year - b.year);

  const x1 = d3.scaleLinear().domain(d3.extent(avgYardsByYear, d => d.year)).range([0, width]);
  const y1 = d3.scaleLinear().domain([0, d3.max(avgYardsByYear, d => d.avgYards)]).nice().range([height, 0]);

  svg1.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x1).tickFormat(d3.format("d")));
  svg1.append("g").call(d3.axisLeft(y1));

  svg1.append("path")
    .datum(avgYardsByYear)
    .attr("fill", "none")
    .attr("stroke", "darkgreen")
    .attr("stroke-width", 2)
    .attr("d", d3.line().x(d => x1(d.year)).y(d => y1(d.avgYards)));

  svg1.append("text")
    .attr("x", width / 2).attr("y", height + 40)
    .attr("text-anchor", "middle").text("Year");
  svg1.append("text")
    .attr("x", -height / 2).attr("y", -40)
    .attr("transform", "rotate(-90)").attr("text-anchor", "middle")
    .text("Avg Passing Yards/Game");

  // Scene 2: Completion Percentage
  const svg2 = d3.select("#scene2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const avgCompByYear = Array.from(
    d3.group(data.filter(d => d["Completion Percentage"] > 0), d => d.Year),
    ([year, records]) => ({ year: +year, avgComp: d3.mean(records, r => r["Completion Percentage"]) })
  ).sort((a, b) => a.year - b.year);

  const x2 = d3.scaleLinear().domain(d3.extent(avgCompByYear, d => d.year)).range([0, width]);
  const y2 = d3.scaleLinear().domain([0, d3.max(avgCompByYear, d => d.avgComp)]).nice().range([height, 0]);

  svg2.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x2).tickFormat(d3.format("d")));
  svg2.append("g").call(d3.axisLeft(y2));

  svg2.append("path")
    .datum(avgCompByYear)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", d3.line().x(d => x2(d.year)).y(d => y2(d.avgComp)));

  svg2.append("text")
    .attr("x", width / 2).attr("y", height + 40)
    .attr("text-anchor", "middle").text("Year");
  svg2.append("text")
    .attr("x", -height / 2).attr("y", -40)
    .attr("transform", "rotate(-90)").attr("text-anchor", "middle")
    .text("Completion %");

  // Scene 3: Explore Top QBs by Year
  const container3 = d3.select("#scene3");
  container3.append("h2").text("Explore Top QBs by Yards/Game");
  const yearSelect = container3.append("select").attr("id", "yearDropdown");

  const svg3 = container3.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const years = Array.from(new Set(data.map(d => d.Year)))
    .filter(y => y >= 1932 && y <= 2016)
    .sort((a, b) => a - b);
  yearSelect.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d).attr("value", d => d);

  function updateScene3(selectedYear) {
    const filtered = data.filter(d =>
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
      .attr("x", width / 2).attr("y", -20)
      .attr("text-anchor", "middle").style("font-size", "16px").style("font-weight", "bold")
      .text(`Top Quarterbacks by Passing Yards/Game – ${selectedYear}`);

    const x = d3.scaleBand()
      .domain(topPlayers.map(d => d.FullName))
      .range([0, width]).padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(topPlayers, d => d["Passing Yards Per Game"])]).nice()
      .range([height, 0]);

    svg3.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    svg3.append("g").call(d3.axisLeft(y));

    svg3.append("text")
      .attr("x", width / 2).attr("y", height + 60)
      .attr("text-anchor", "middle").text("Quarterback (First Last)");

    svg3.append("text")
      .attr("x", -height / 2).attr("y", -40)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Yards/Game");

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("font-size", "12px");

    svg3.selectAll("rect")
      .data(topPlayers)
      .enter()
      .append("rect")
      .attr("x", d => x(d.FullName))
      .attr("y", height)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", "orange")
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1)
          .html(`<strong>${d.FullName}</strong><br>
                Team: ${d.Team}<br>
                Yards/Game: ${d["Passing Yards Per Game"].toFixed(1)}<br>
                Comp%: ${d["Completion Percentage"]}%<br>
                TDs: ${d["TD Passes"]}<br>
                INTs: ${d.Ints}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0))
      .transition()
      .duration(800)
      .attr("y", d => y(d["Passing Yards Per Game"]))
      .attr("height", d => height - y(d["Passing Yards Per Game"]));
  }

  updateScene3(2016);
  yearSelect.on("change", function () {
    updateScene3(this.value);
  });
});
