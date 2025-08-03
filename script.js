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
    .html(`
      Early NFL offenses focused on the run—quarterbacks rarely threw for big yardage. 
      As the league evolved, passing attacks became more sophisticated.  
      This line plot shows how the average passing yards per game climbed from under 100 in the 1930s to over 200 today.
    `);

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

  // =============== Scene 2 ===============
  const scene2 = d3.select("#scene2");
  scene2.append("div").attr("class","narrative")
    .html(`
      Quarterbacks also got more accurate.  This chart traces the jump in completion percentage—
      from under 50% in early decades to the mid-60s and beyond today, 
      thanks to rule changes protecting passers and refined offensive schemes.
    `);

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

  // =============== Scene 3 ===============
  const scene3 = d3.select("#scene3");
  scene3.append("div").attr("class","narrative")
    .html(`
      Finally, explore the top individual performers.  
      Select a season to see the 15 quarterbacks with the highest passing yards per game.
    `);

  scene3.append("h2").text("Explore Top QBs by Yards/Game");

  // 1️⃣ Create the tooltip with full inline styles
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
    .style("opacity", 0)
    .style("z-index", 9999);

  let selectedYear = 2016;
  const yearSelect = scene3.append("select")
      .attr("id","yearDropdown")
      .style("margin","0 0 12px 0");

  scene3.append("div").attr("class","chart-caption")
    .text("Figure 3: Top 15 QBs by passing yards per game for the selected season.");

  const svg3 = scene3.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const annotationBox = scene3.append("div").attr("class","chart-caption");

  const years = Array.from(new Set(data.map(d => d.Year)))
    .filter(y=>y>=1932 && y<=2016)
    .sort((a,b)=>a-b);

  yearSelect.selectAll("option")
    .data(years)
    .enter().append("option")
      .text(d=>d)
      .attr("value",d=>d);

  function updateScene3(year) {
    selectedYear = +year;
    const filtered = data.filter(d=>d.Year===selectedYear && d["Passing Yards Per Game"]>0);
    const top = filtered
      .sort((a,b)=>b["Passing Yards Per Game"]-a["Passing Yards Per Game"])
      .slice(0,15);

    top.forEach(d=>{
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

    // 2️⃣ Draw bars with hover handlers
    svg3.selectAll("rect")
      .data(top)
      .enter().append("rect")
        .attr("x",    d=>x(d.FullName))
        .attr("y",    height)
        .attr("width",x.bandwidth())
        .attr("height",0)
        .attr("fill","orange")
      .on("mouseover", (event, d) => {
        tooltip
          .html(`
            <strong>${d.FullName}</strong><br/>
            YPG: ${d["Passing Yards Per Game"].toFixed(1)}<br/>
            Comp %: ${d["Completion Percentage"].toFixed(1)}<br/>
            TDs: ${d["TD Passes"]}<br/>
            INTs: ${d.Ints}
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top",  (event.pageY - 40) + "px")
          .transition().duration(200).style("opacity", 1);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(300).style("opacity", 0);
      })
      .transition().duration(800)
        .attr("y",      d=>y(d["Passing Yards Per Game"]))
        .attr("height", d=>height - y(d["Passing Yards Per Game"]));

    // dynamic annotation
    const best = top[0];
    let eraText = selectedYear < 1980
      ? "In the run-heavy era, even the best passed under 200 ypg."
      : selectedYear < 2000
      ? "West Coast and shotgun offenses lifted aerial output."
      : "Modern rules and spread schemes unleashed prolific passers.";

    annotationBox.text(
      `In ${selectedYear}, ${best.FullName} led with ${best["Passing Yards Per Game"].toFixed(1)} ypg. ${eraText}`
    );
  }

  // initialize Scene 3
  updateScene3(years.at(-1));
  yearSelect.on("change", function() {
    updateScene3(this.value);
  });

});
