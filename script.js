// script.js

// 🎯 Toggle scenes via buttons
window.showScene = function(sceneId) {
  ['scene1','scene2','scene3'].forEach(id => {
    document.getElementById(id).style.display = id === sceneId ? 'block' : 'none';
    document.getElementById('btn' + id.slice(-1))
            .classList.toggle('active', id === sceneId);
  });
};

// 📐 Chart layout (wider right margin for annotations)
const margin = { top: 50, right: 150, bottom: 100, left: 60 },
      width  = 800 - margin.left - margin.right,
      height = 500 - margin.top  - margin.bottom;

// 📊 Load and preprocess data
d3.csv("data/Career_Stats_Passing.csv").then(data => {
  data.forEach(d => {
    Object.keys(d).forEach(k => {
      const ck = k.trim();
      if (ck !== k) { d[ck] = d[k]; delete d[k]; }
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
    .text("In the NFL’s early years teams passed sparingly. Average passing yards per game was under 100. As rules changed and coaches opened up the field the league saw a steady rise in passing yardage.");

  const svg1 = scene1.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgY = Array.from(
    d3.group(data.filter(d => d["Passing Yards Per Game"] > 0), d => d.Year),
    ([year, recs]) => ({ year, yards: d3.mean(recs, r => r["Passing Yards Per Game"]) })
  ).sort((a,b) => a.year - b.year);

  const x1 = d3.scaleLinear().domain(d3.extent(avgY, d => d.year)).range([0, width]);
  const y1 = d3.scaleLinear().domain([0, d3.max(avgY, d => d.yards)]).nice().range([height, 0]);

  svg1.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x1).tickFormat(d3.format("d")));
  svg1.append("g").call(d3.axisLeft(y1));

  svg1.append("path")
      .datum(avgY)
      .attr("fill","none")
      .attr("stroke","darkgreen")
      .attr("stroke-width",2)
      .attr("d", d3.line().x(d => x1(d.year)).y(d => y1(d.yards)));

  scene1.append("div").attr("class","chart-caption")
    .text("Figure 1: Average passing yards per game (1930-2016)");

  // Annotation at peak point
  const peakY = avgY.reduce((a,b) => a.yards > b.yards ? a : b);
  const px1 = x1(peakY.year), py1 = y1(peakY.yards);
  svg1.append("circle").attr("cx",px1).attr("cy",py1).attr("r",5).attr("fill","red");
  const anchor1 = px1 > width * 0.8 ? "end" : "start";
  const tx1     = anchor1==="end" ? px1 - 8 : px1 + 8;
  const note1Lines = peakY.year < 1950
    ? ["Before modern passing schemes"]
    : peakY.year < 2000
    ? ["Rise of West Coast and Coryell systems"]
    : ["Spread offenses and rule changes","boosted yardage"];
  const text1 = svg1.append("text")
      .attr("x", tx1).attr("y", py1 - 8).attr("text-anchor", anchor1)
      .style("font-size","12px").style("font-weight","bold").style("fill","red");
  text1.append("tspan").attr("x", tx1).attr("dy", 0).text(`${peakY.year}: ${peakY.yards.toFixed(1)} ypg`);
  note1Lines.forEach((line,i) => {
    text1.append("tspan").attr("x", tx1).attr("dy", 16).text(line);
  });

  // =============== Scene 2 ===============
  const scene2 = d3.select("#scene2");
  scene2.append("div").attr("class","narrative")
    .text("Quarterbacks became more accurate. Completion rates rose from under 50% to over 65% thanks to new rules and refined offensive systems.");

  const svg2 = scene2.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const avgC = Array.from(
    d3.group(data.filter(d => d["Completion Percentage"] > 0), d => d.Year),
    ([year, recs]) => ({ year, comp: d3.mean(recs, r => r["Completion Percentage"]) })
  ).sort((a,b) => a.year - b.year);

  const x2 = d3.scaleLinear().domain(d3.extent(avgC, d => d.year)).range([0, width]);
  const y2 = d3.scaleLinear().domain([0, d3.max(avgC, d => d.comp)]).nice().range([height, 0]);

  svg2.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x2).tickFormat(d3.format("d")));
  svg2.append("g").call(d3.axisLeft(y2));

  svg2.append("path")
      .datum(avgC)
      .attr("fill","none")
      .attr("stroke","steelblue")
      .attr("stroke-width",2)
      .attr("d", d3.line().x(d => x2(d.year)).y(d => y2(d.comp)));

  scene2.append("div").attr("class","chart-caption")
    .text("Figure 2: Average completion percentage (1930-2016)");

  // Annotation at peak point
  const peakC = avgC.reduce((a,b) => a.comp > b.comp ? a : b);
  const px2 = x2(peakC.year), py2 = y2(peakC.comp);
  svg2.append("circle").attr("cx",px2).attr("cy",py2).attr("r",5).attr("fill","red");
  const anchor2 = px2 > width * 0.8 ? "end" : "start";
  const tx2     = anchor2==="end" ? px2 - 8 : px2 + 8;
  const note2Lines = peakC.year < 1970
    ? ["Initial rules began protecting passers"]
    : peakC.year < 2000
    ? ["Coaching and schemes improved accuracy"]
    : ["Short passing and rule changes","drove completion"];
  const text2 = svg2.append("text")
      .attr("x", tx2).attr("y", py2 - 8).attr("text-anchor", anchor2)
      .style("font-size","12px").style("font-weight","bold").style("fill","red");
  text2.append("tspan").attr("x", tx2).attr("dy",0).text(`${peakC.year}: ${peakC.comp.toFixed(1)}%`);
  note2Lines.forEach(line => {
    text2.append("tspan").attr("x", tx2).attr("dy",16).text(line);
  });

  // =============== Scene 3 ===============
  const scene3 = d3.select("#scene3");
  scene3.append("div").attr("class","narrative")
    .text("Select a season, number of QBs and a stat to explore the league leaders.");
  scene3.append("h2").text("Explore Top QBs by Stat");

  // Year dropdown
  let selectedYear = 2016;
  const yearSelect = scene3.append("select")
      .attr("id","yearDropdown")
      .style("margin","0 12px 12px 0");

  // Top-N slider
  let topN = 15;
  scene3.append("label").text("Number of QBs: ");
  const topNSlider = scene3.append("input")
      .attr("type","range")
      .attr("min",5)
      .attr("max",30)
      .attr("value",topN);
  const topNLabel = scene3.append("span").text(topN);

  // Metric selector
  let metric = "Passing Yards Per Game";
  scene3.append("label").style("margin","0 8px").text("Metric: ");
  const metricSelect = scene3.append("select").attr("id","metricSelect");
  metricSelect.selectAll("option")
    .data([
      { value: "Passing Yards Per Game", text: "Yards/Game" },
      { value: "Completion Percentage",  text: "Completion %" }
    ])
    .enter().append("option")
      .attr("value", d => d.value)
      .text(d => d.text);

  // Caption
  scene3.append("div").attr("class","chart-caption")
    .text("Figure 3: Top QBs by the selected metric in the chosen season.");

  // SVG container
  const svg3 = scene3.append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip
  const tooltip = d3.select("body").append("div")
      .attr("class","tooltip")
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

  // Populate years
  const years = Array.from(new Set(data.map(d => d.Year)))
    .filter(y => y >= 1932 && y <= 2016)
    .sort((a,b) => a - b);
  yearSelect.selectAll("option")
    .data(years).enter()
    .append("option")
      .text(d => d)
      .attr("value", d => d);
  yearSelect.property("value", 2016);


  // Triggers
  yearSelect.on("change", function() {
    selectedYear = +this.value;
    updateScene3(selectedYear, topN, metric);
  });
  topNSlider.on("input", function() {
    topN = +this.value;
    topNLabel.text(topN);
    updateScene3(selectedYear, topN, metric);
  });
  metricSelect.on("change", function() {
    metric = this.value;
    updateScene3(selectedYear, topN, metric);
  });

  // Update function
  function updateScene3(year, topN, metric) {
    const topPlayers = data
      .filter(d => d.Year === year && d[metric] > 0)
      .sort((a,b) => b[metric] - a[metric])
      .slice(0, topN)
      .map(d => {
        const [last, first] = d.Name.split(", ");
        return { ...d, FullName: `${first} ${last}` };
      });

    svg3.selectAll("*").remove();

    const x = d3.scaleBand()
      .domain(topPlayers.map(d => d.FullName))
      .range([0, width])
      .padding(0.2);
    const y = d3.scaleLinear()
      .domain([0, d3.max(topPlayers, d => d[metric])])
      .nice()
      .range([height, 0]);

    svg3.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "rotate(-35)")
        .style("text-anchor", "end")
        .style("font-size", "10px");

    svg3.append("g").call(d3.axisLeft(y));

    // Bars + hover
    svg3.selectAll("rect")
      .data(topPlayers).enter().append("rect")
        .attr("x", d => x(d.FullName))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "orange")
      .on("mouseover", (e,d) => {
        tooltip.html(
          `<strong>${d.FullName}</strong><br/>` +
          `Team: ${d.Team}<br/>` +
          `${metric}: ${d[metric].toFixed(1)}`
        )
        .style("left", (e.pageX+10)+"px")
        .style("top",  (e.pageY-40)+"px")
        .transition().duration(200).style("opacity",1);
      })
      .on("mouseout", () => tooltip.transition().duration(300).style("opacity",0))
      .transition().duration(800)
        .attr("y", d => y(d[metric]))
        .attr("height", d => height - y(d[metric]));

    // Highlight & annotate top performer
    const best = topPlayers[0];
    const cx = x(best.FullName) + x.bandwidth()/2;
    const cy = y(best[metric]);

    svg3.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 5)
      .attr("fill", "red");

    const diff = (best[metric] - topPlayers[1][metric]).toFixed(1);
    const anchor3 = cx > width * 0.8 ? "end" : "start";
    const tx3     = anchor3 === "end" ? cx - 8 : cx + 8;

    const text3 = svg3.append("text")
      .attr("x", tx3)
      .attr("y", cy - 8)
      .attr("text-anchor", anchor3)
      .style("font-size","12px")
      .style("font-weight","bold")
      .style("fill","red");

    text3.append("tspan")
      .attr("x", tx3)
      .attr("dy", 0)
      .text(`${best.FullName}: ${best[metric].toFixed(1)}`);

    text3.append("tspan")
      .attr("x", tx3)
      .attr("dy", 16)
      .text(`${best.Team} led by ${diff} over second place`);
  }

  // initialize Scene 3
  updateScene3(selectedYear, topN, metric);

});
