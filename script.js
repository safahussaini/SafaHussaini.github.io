// Scene toggler
window.showScene = function (sceneId) {
  ["scene1", "scene2", "scene3", "scene4"].forEach(id => {
    document.getElementById(id).style.display = id === sceneId ? "block" : "none";
  });

  switch (sceneId) {
    case "scene1": scene1(); break;
    case "scene2": scene2(); break;
    case "scene3": scene3(); break;
    case "scene4": scene4(); break;
  }
};

// Setup chart
function createSVG(containerId) {
  const margin = { top: 50, right: 30, bottom: 70, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select(`#${containerId}`)
    .html("") // clear previous chart
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { svg, width, height };
}

// Scene 1: Average Passing Yards
function scene1() {
  const { svg, width, height } = createSVG("scene1");

  d3.csv("data/Career_Stats_Passing.csv").then(data => {
    data.forEach(d => {
      d.Year = +d.Year;
      d["Passing Yards Per Game"] = +d["Passing Yards Per Game"];
    });

    const yearlyAvg = Array.from(
      d3.group(data.filter(d => d.Year > 0 && !isNaN(d["Passing Yards Per Game"])), d => d.Year),
      ([year, rows]) => ({
        year: +year,
        avgYards: d3.mean(rows, r => r["Passing Yards Per Game"])
      })
    );

    const x = d3.scaleLinear()
      .domain(d3.extent(yearlyAvg, d => d.year))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(yearlyAvg, d => d.avgYards)]).nice()
      .range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    svg.append("g").call(d3.axisLeft(y));

    svg.append("path")
      .datum(yearlyAvg)
      .attr("fill", "none")
      .attr("stroke", "darkgreen")
      .attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.avgYards)));
  });
}

// Scene 2: Completion Percentage Over Time
function scene2() {
  const { svg, width, height } = createSVG("scene2");

  d3.csv("data/Career_Stats_Passing.csv").then(data => {
    data.forEach(d => {
      d.Year = +d.Year;
      d["Completion Percentage"] = +d["Completion Percentage"];
    });

    const yearlyAvg = Array.from(
      d3.group(data.filter(d => d.Year > 0 && !isNaN(d["Completion Percentage"])), d => d.Year),
      ([year, rows]) => ({
        year: +year,
        avgComp: d3.mean(rows, r => r["Completion Percentage"])
      })
    );

    const x = d3.scaleLinear().domain(d3.extent(yearlyAvg, d => d.year)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(yearlyAvg, d => d.avgComp)]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    svg.append("g").call(d3.axisLeft(y));

    svg.append("path")
      .datum(yearlyAvg)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.avgComp)));
  });
}

// Scene 3: Top Players by Yards
function scene3() {
  const { svg, width, height } = createSVG("scene3");

  d3.csv("data/Career_Stats_Passing.csv").then(data => {
    data.forEach(d => d["Passing Yards"] = +d["Passing Yards"]);

    const top = Array.from(
      d3.rollup(data, v => d3.sum(v, d => d["Passing Yards"]), d => d.Name),
      ([name, total]) => ({ name: name.split(", ").reverse().join(" "), total })
    ).sort((a, b) => d3.descending(a.total, b.total)).slice(0, 10);

    const x = d3.scaleBand().domain(top.map(d => d.name)).range([0, width]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(top, d => d.total)]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("rect")
      .data(top)
      .enter()
      .append("rect")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.total))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.total))
      .attr("fill", "orange");

    svg.selectAll(".label")
      .data(top)
      .enter()
      .append("text")
      .attr("x", d => x(d.name) + x.bandwidth() / 2)
      .attr("y", d => y(d.total) - 5)
      .attr("text-anchor", "middle")
      .text(d => Math.round(d.total));
  });
}

// Scene 4: Combined Offense vs Defense
function scene4() {
  const { svg, width, height } = createSVG("scene4");

  Promise.all([
    d3.csv("data/Career_Stats_Passing.csv"),
    d3.csv("data/Career_Stats_Defensive.csv")
  ]).then(([passing, defense]) => {
    passing = passing.filter(d => +d.Year > 0 && !isNaN(+d["Passing Yards"])).map(d => ({
      year: +d.Year,
      yards: +d["Passing Yards"]
    }));

    defense = defense.filter(d => +d.Year > 0 && !isNaN(+d.Sacks)).map(d => ({
      year: +d.Year,
      sacks: +d.Sacks
    }));

    const offenseByYear = Array.from(
      d3.group(passing, d => d.year),
      ([year, rows]) => ({
        year: +year,
        avgYards: d3.mean(rows, r => r.yards)
      })
    ).filter(d => !isNaN(d.avgYards));

    const defenseByYear = Array.from(
      d3.group(defense, d => d.year),
      ([year, rows]) => ({
        year: +year,
        avgSacks: d3.mean(rows, r => r.sacks)
      })
    ).filter(d => !isNaN(d.avgSacks));

    const years = [...new Set([...offenseByYear.map(d => d.year), ...defenseByYear.map(d => d.year)])].sort((a, b) => a - b);

    const x = d3.scaleLinear().domain(d3.extent(years)).range([0, width]);
    const yLeft = d3.scaleLinear().domain([0, d3.max(offenseByYear, d => d.avgYards)]).range([height, 0]);
    const yRight = d3.scaleLinear().domain([0, d3.max(defenseByYear, d => d.avgSacks)]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(yLeft));
    svg.append("g").attr("transform", `translate(${width},0)`).call(d3.axisRight(yRight));

    svg.append("path")
      .datum(offenseByYear)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.year)).y(d => yLeft(d.avgYards)));

    svg.append("path")
      .datum(defenseByYear)
      .attr("fill", "none")
      .attr("stroke", "crimson")
      .attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.year)).y(d => yRight(d.avgSacks)));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Green: Avg Passing Yards | Red: Avg Sacks");
  });
}

// Show default scene
scene1();
