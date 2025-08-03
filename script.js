// script.js
// 🎯 Toggle scenes via buttons
window.showScene = function(sceneId) {
  ['scene1','scene2','scene3'].forEach(id => {
    document.getElementById(id).style.display = (id === sceneId ? 'block' : 'none');
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
  scene1.append("div")
    .attr("class","narrative")
    .html(`
      <p>Over the league’s first decades, passing was secondary to the ground game: 
      quarterbacks averaged under 100 yards per game. As coaches innovated and rules 
      shifted to favor the aerial attack, that average climbed steadily. This 
      chart traces how the quarterback role evolved from game manager to offensive centerpiece.</p>
    `);

  const svg1 = scene1.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgYardsByYear = Array.from(
    d3.group(data.filter(d => d["Passing Yards Per Game"] > 0), d => d.Year),
    ([year, recs]) => ({ year: +year, avgYards: d3.mean(recs, r => r["Passing Yards Per Game"]) })
  ).sort((a,b) => a.year - b.year);

  const x1 = d3.scaleLinear().domain(d3.extent(avgYardsByYear, d => d.year)).range([0,width]);
  const y1 = d3.scaleLinear().domain([0, d3.max(avgYardsByYear, d=>d.avgYards)]).nice().range([height,0]);

  svg1.append("g")
      .attr("transform",`translate(0,${height})`)
      .call(d3.axisBottom(x1).tickFormat(d3.format("d")));
  svg1.append("g").call(d3.axisLeft(y1));

  svg1.append("text")
      .attr("x", width/2).attr("y", height+40)
      .attr("text-anchor","middle")
      .text("Year");
  svg1.append("text")
      .attr("x",-height/2).attr("y",-40)
      .attr("transform","rotate(-90)")
      .attr("text-anchor","middle")
      .text("Avg Passing Yards/Game");

  svg1.append("path")
      .datum(avgYardsByYear)
      .attr("fill","none")
      .attr("stroke","darkgreen")
      .attr("stroke-width",2)
      .attr("d", d3.line()
        .x(d => x1(d.year))
        .y(d => y1(d.avgYards))
      );

  // =============== Scene 2 ===============
  const scene2 = d3.select("#scene2");
  scene2.append("div")
    .attr("class","narrative")
    .html(`
      <p>Completion efficiency skyrocketed alongside yardage gains. Early-era QBs 
      completed under 50% of passes; today’s starters often hover in the mid-60s. 
      Improvements in quarterback mechanics, route precision, and protective rules 
      are all on display here.</p>
    `);

  const svg2 = scene2.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgCompByYear = Array.from(
    d3.group(data.filter(d => d["Completion Percentage"] > 0), d => d.Year),
    ([year, recs]) => ({ year: +year, avgComp: d3.mean(recs, r => r["Completion Percentage"]) })
  ).sort((a,b) => a.year - b.year);

  const x2 = d3.scaleLinear().domain(d3.extent(avgCompByYear, d=>d.year)).range([0,width]);
  const y2 = d3.scaleLinear().domain([0, d3.max(avgCompByYear, d=>d.avgComp)]).nice().range([height,0]);

  svg2.append("g")
      .attr("transform",`translate(0,${height})`)
      .call(d3.axisBottom(x2).tickFormat(d3.format("d")));
  svg2.append("g").call(d3.axisLeft(y2));

  svg2.append("text")
      .attr("x", width/2).attr("y", height+40)
      .attr("text-anchor","middle")
      .text("Year");
  svg2.append("text")
      .attr("x",-height/2).attr("y",-40)
      .attr("transform","rotate(-90)")
      .attr("text-anchor","middle")
      .text("Completion Percentage (%)");

  svg2.append("path")
      .datum(avgCompByYear)
      .attr("fill","none")
      .attr("stroke","steelblue")
      .attr("stroke-width",2)
      .attr("d", d3.line()
        .x(d => x2(d.year))
        .y(d => y2(d.avgComp))
      );

  // =============== Scene 3 ===============
  const scene3 = d3.select("#scene3");
  scene3.append("div")
    .attr("class","narrative")
    .html(`
      <p>Now let’s spotlight individual brilliance. Pick a year to see 
      the top 15 QBs by passing yards per game. You’ll see how rule changes, 
      scheme innovations and superstar talent shaped each era’s aerial leaders.</p>
    `);

  scene3.append("h2").text("Explore Top QBs by Yards/Game");

  let selectedYear = 2016;
  const yearSelect = scene3.append("select")
      .attr("id","yearDropdown")
      .style("margin-bottom","10px");

  const annotationBox = scene3.append("div")
      .attr("id","scene3-annotation");

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
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  function updateScene3(year) {
    selectedYear = +year;
    const filtered = data.filter(d => d.Year === selectedYear && d["Passing Yards Per Game"] > 0);
    const topPlayers = filtered
      .sort((a,b) => b["Passing Yards Per Game"] - a["Passing Yards Per Game"])
      .slice(0,15);

    topPlayers.forEach(d => {
      const [last, first] = d.Name.split(", ");
      d.FullName = `${first} ${last}`;
    });

    svg3.selectAll("*").remove();
    const x = d3.scaleBand()
      .domain(topPlayers.map(d => d.FullName))
      .range([0,width])
      .padding(0.2);
    const y = d3.scaleLinear()
      .domain([0, d3.max(topPlayers, d=>d["Passing Yards Per Game"])])
      .nice()
      .range([height,0]);

    svg3.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform","rotate(-35)")
        .style("text-anchor","end")
        .style("font-size","10px");
    svg3.append("g").call(d3.axisLeft(y));

    svg3.append("text")
        .attr("x", width/2).attr("y", height+50)
        .attr("text-anchor","middle")
        .text("Quarterback Name");
    svg3.append("text")
        .attr("x",-height/2).attr("y",-40)
        .attr("transform","rotate(-90)")
        .attr("text-anchor","middle")
        .text("Passing Yards per Game");

    const tooltip = d3.select("body").append("div")
        .style("opacity",0)
        .style("position","absolute")
        .style("background","#fff")
        .style("border","1px solid #ccc")
        .style("padding","8px")
        .style("border-radius","5px")
        .style("pointer-events","none")
        .style("font-size","12px");

    svg3.selectAll("rect")
      .data(topPlayers)
      .enter()
      .append("rect")
        .attr("x", d => x(d.FullName))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill","orange")
      .on("mouseover", (event,d) => {
        tooltip.transition().duration(200).style("opacity",1);
        tooltip.html(`
          <strong>${d.FullName}</strong><br/>
          Team: ${d.Team}<br/>
          YPG: ${d["Passing Yards Per Game"].toFixed(1)}<br/>
          Comp %: ${d["Completion Percentage"].toFixed(1)}<br/>
          TDs: ${d["TD Passes"]}<br/>
          INTs: ${d.Ints}
        `)
        .style("left", (event.pageX+10)+"px")
        .style("top",  (event.pageY-40)+"px");
      })
      .on("mouseout", () => tooltip.transition().duration(300).style("opacity",0))
      .transition().duration(800)
        .attr("y", d => y(d["Passing Yards Per Game"]))
        .attr("height", d => height - y(d["Passing Yards Per Game"]));

    // Dynamic narrative by era
    let eraText;
    if (selectedYear < 1980) {
      eraText = "Ground-focused offenses meant high-yardage seasons were rare.";
    } else if (selectedYear < 2000) {
      eraText = "The West Coast offense and shotgun formations boosted aerial output.";
    } else {
      eraText = "Modern spread schemes and favorable rules have produced prolific passers.";
    }

    annotationBox.html(`
      <p>In <strong>${selectedYear}</strong>, the top QB was 
      <strong>${topPlayers[0]?.FullName}</strong> with 
      <strong>${topPlayers[0]?.["Passing Yards Per Game"].toFixed(1)}</strong> YPG. 
      ${eraText}</p>
    `);
  }

  // initialize
  updateScene3(years.at(-1));
  yearSelect.on("change", function() {
    updateScene3(this.value);
  });
});
