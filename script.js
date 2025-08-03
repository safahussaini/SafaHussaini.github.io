// script.js

// 🎯 Toggle scenes via buttons
window.showScene = function(sceneId) {
  ['scene1','scene2','scene3'].forEach(id => {
    document.getElementById(id).style.display = id === sceneId ? 'block' : 'none';
    document.getElementById('btn' + id.slice(-1))
            .classList.toggle('active', id === sceneId);
  });
};

// 📐 Chart layout
const margin = { top: 50, right: 30, bottom: 100, left: 60 },
      width  = 800 - margin.left - margin.right,
      height = 500 - margin.top  - margin.bottom;

// 📊 Load and preprocess data
d3.csv("data/Career_Stats_Passing.csv").then(data => {
  data.forEach(d => {
    Object.keys(d).forEach(key => {
      const cleanKey = key.trim();
      if (cleanKey !== key) {
        d[cleanKey] = d[key];
        delete d[key];
      }
    });
    d.Year                      = +d.Year;
    d["Passing Yards Per Game"] = +d["Passing Yards Per Game"] || 0;
    d["Completion Percentage"]  = +d["Completion Percentage"]   || 0;
    d["TD Passes"]              = +d["TD Passes"]               || 0;
    d.Ints                      = +d.Ints                       || 0;
  });

  // =============== Scene 1 ===============
  const scene1 = d3.select("#scene1");
  scene1.append("div").attr("class","narrative")
    .text(
      "In the NFL’s early decades, teams ran far more than they passed. Quarterbacks averaged under 100 yards through the air per game. Over time, rule changes and passing innovations drove that average steadily upward."
    );

  const svg1 = scene1.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgYardsByYear = Array.from(
    d3.group(data.filter(d => d["Passing Yards Per Game"] > 0), d => d.Year),
    ([year, recs]) => ({ year, avgYards: d3.mean(recs, r => r["Passing Yards Per Game"]) })
  ).sort((a,b) => a.year - b.year);

  const x1 = d3.scaleLinear()
      .domain(d3.extent(avgYardsByYear, d=>d.year))
      .range([0, width]);
  const y1 = d3.scaleLinear()
      .domain([0, d3.max(avgYardsByYear, d=>d.avgYards)])
      .nice()
      .range([height, 0]);

  svg1.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x1).tickFormat(d3.format("d")));
  svg1.append("g").call(d3.axisLeft(y1));

  svg1.append("path")
      .datum(avgYardsByYear)
      .attr("fill","none")
      .attr("stroke","darkgreen")
      .attr("stroke-width",2)
      .attr("d", d3.line()
        .x(d=>x1(d.year))
        .y(d=>y1(d.avgYards))
      );

  scene1.append("div").attr("class","chart-caption")
    .text("Figure 1: Average passing yards per game, by season (1930–2016)");

  // Annotation inside Scene 1
  const peakY = avgYardsByYear.reduce((a,b) => a.avgYards > b.avgYards ? a : b);
  svg1.append("circle")
      .attr("cx", x1(peakY.year))
      .attr("cy", y1(peakY.avgYards))
      .attr("r", 5)
      .attr("fill", "red");
  svg1.append("text")
      .attr("x", x1(peakY.year) + 8)
      .attr("y", y1(peakY.avgYards) - 8)
      .text(`${peakY.year}: ${peakY.avgYards.toFixed(1)} yds`)
      .style("font-size","12px")
      .style("font-weight","bold")
      .style("fill","red");

  // =============== Scene 2 ===============
  const scene2 = d3.select("#scene2");
  scene2.append("div").attr("class","narrative")
    .text(
      "Quarterbacks also got more accurate. Completion rates rose from under 50% in the league’s early era to over 65% today, thanks to protective rules and advanced passing systems."
    );

  const svg2 = scene2.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgCompByYear = Array.from(
    d3.group(data.filter(d => d["Completion Percentage"] > 0), d => d.Year),
    ([year, recs]) => ({ year, avgComp: d3.mean(recs, r=>r["Completion Percentage"]) })
  ).sort((a,b) => a.year - b.year);

  const x2 = d3.scaleLinear()
      .domain(d3.extent(avgCompByYear, d=>d.year))
      .range([0, width]);
  const y2 = d3.scaleLinear()
      .domain([0, d3.max(avgCompByYear, d=>d.avgComp)])
      .nice()
      .range([height, 0]);

  svg2.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x2).tickFormat(d3.format("d")));
  svg2.append("g").call(d3.axisLeft(y2));

  svg2.append("path")
      .datum(avgCompByYear)
      .attr("fill","none")
      .attr("stroke","steelblue")
      .attr("stroke-width",2)
      .attr("d", d3.line()
        .x(d=>x2(d.year))
        .y(d=>y2(d.avgComp))
      );

  scene2.append("div").attr("class","chart-caption")
    .text("Figure 2: Average completion percentage, by season (1930–2016)");

  // Annotation inside Scene 2
  const peakC = avgCompByYear.reduce((a,b) => a.avgComp > b.avgComp ? a : b);
  svg2.append("circle")
      .attr("cx", x2(peakC.year))
      .attr("cy", y2(peakC.avgComp))
      .attr("r", 5)
      .attr("fill", "red");
  svg2.append("text")
      .attr("x", x2(peakC.year) + 8)
      .attr("y", y2(peakC.avgComp) - 8)
      .text(`${peakC.year}: ${peakC.avgComp.toFixed(1)}%`)
      .style("font-size","12px")
      .style("font-weight","bold")
      .style("fill","red");

  // =============== Scene 3 ===============
  const scene3 = d3.select("#scene3");
  scene3.append("div").attr("class","narrative")
    .text(
      "Now look at individual seasons. Select a year to see the top 15 quarterbacks by average passing yards."
    );
  scene3.append("h2").text("Explore Top QBs by Yards/Game");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position","absolute")
    .style("pointer-events","none")
    .style("background","#fff")
    .style("border","1px solid #ccc")
    .style("padding","8px")
    .style("border-radius","4px")
    .style("font-size","12px")
    .style("box-shadow","0 2px 4px rgba(0,0,0,0.2)")
    .style("opacity",0)
    .style("z-index",9999);

  // Dropdown parameter
  let selectedYear = 2016;
  const yearSelect = scene3.append("select")
      .attr("id","yearDropdown")
      .style("margin","0 0 12px 0");

  scene3.append("div").attr("class","chart-caption")
    .text("Figure 3: Top 15 QBs by passing yards per game in the selected season.");

  const svg3 = scene3.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const years = Array.from(new Set(data.map(d => d.Year)))
    .filter(y => y >= 1932 && y <= 2016)
    .sort((a,b) => a - b);

  yearSelect.selectAll("option")
    .data(years)
    .enter().append("option")
      .text(d=>d)
      .attr("value",d=>d);

  // Update function (trigger + parameter)
  function updateScene3(year) {
    selectedYear = +year;
    const filtered = data.filter(d=> d.Year===selectedYear && d["Passing Yards Per Game"]>0);
    const top = filtered
      .sort((a,b)=> b["Passing Yards Per Game"]-a["Passing Yards Per Game"])
      .slice(0,15);

    top.forEach(d=> {
      const [last, first] = d.Name.split(", ");
      d.FullName = `${first} ${last}`;
    });

    svg3.selectAll("*").remove();

    const x = d3.scaleBand()
      .domain(top.map(d=>d.FullName))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(top, d=>d["Passing Yards Per Game"])])
      .nice()
      .range([height, 0]);

    svg3.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform","rotate(-35)")
        .style("text-anchor","end")
        .style("font-size","10px");

    svg3.append("g").call(d3.axisLeft(y));

    svg3.selectAll("rect")
      .data(top)
      .enter().append("rect")
        .attr("x",    d=>x(d.FullName))
        .attr("y",    height)
        .attr("width",x.bandwidth())
        .attr("height",0)
        .attr("fill","orange")
      .on("mouseover", (event,d) => {
        tooltip.html(`
          <strong>${d.FullName}</strong><br/>
          YPG: ${d["Passing Yards Per Game"].toFixed(1)}<br/>
          Comp %: ${d["Completion Percentage"].toFixed(1)}<br/>
          TDs: ${d["TD Passes"]}<br/>
          INTs: ${d.Ints}
        `)
        .style("left", (event.pageX+10)+"px")
        .style("top",  (event.pageY-40)+"px")
        .transition().duration(200).style("opacity",1);
      })
      .on("mouseout", () => { tooltip.transition().duration(300).style("opacity",0); })
      .transition().duration(800)
        .attr("y",      d=>y(d["Passing Yards Per Game"]))
        .attr("height", d=> height - y(d["Passing Yards Per Game"]));

    // Annotation inside Scene 3
    const best = top[0];
    const px = x(best.FullName) + x.bandwidth() / 2;
    const py = y(best["Passing Yards Per Game"]);

    svg3.append("circle")
      .attr("cx", px)
      .attr("cy", py)
      .attr("r", 5)
      .attr("fill", "red");

    svg3.append("text")
      .attr("x", px + 8)
      .attr("y", py - 8)
      .text(`${best.FullName}: ${best["Passing Yards Per Game"].toFixed(1)} ypg`)
      .style("font-size","12px")
      .style("font-weight","bold")
      .style("fill","red");
  }

  // initialize scene 3
  updateScene3(years.at(-1));
  yearSelect.on("change", function() {
    updateScene3(this.value);
  });
});
