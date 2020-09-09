function vis5(data, div) {
  const margin = {top: 180, right: 20, bottom: 40, left: 160};

  const visWidth = 1300 - margin.left - margin.right;
  const visHeight = 700 - margin.top - margin.bottom;

  const svg = div.append('svg')
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //add lable
  g.append("text")
    .attr("x", visWidth / 2)
    .attr("y", -margin.top + 160)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .text("Top 10 “Coalesced Purposes” of Donations Over Time");

  // data transformation
  const topPurpose = Array.from(d3.rollup(data,
          amounts => d3.sum(amounts, d => d.commitment_amount_usd_constant),
          d => d.coalesced_purpose_name), ([purpose, sum]) => ({purpose, sum}))
    .sort((a, b) => d3.descending(a.sum, b.sum))
    .slice(0, 11)
    .filter(d => d.purpose !=="Sectors not specified")
    .map(d => d.purpose);

  const  dataOnlyTopPurpose = data.filter(d => topPurpose.includes(d.coalesced_purpose_name));

  const counts = d3.rollup(dataOnlyTopPurpose,
                           amounts => d3.sum(amounts, d => d.commitment_amount_usd_constant),
                          d=> d.year, d=> d.coalesced_purpose_name);

  const dataByPurpose = Array.from(counts, (([year, map]) => {
    map.set('total', d3.sum(map.values()));
    map.set('year', year);
    return Object.fromEntries(map)
  })).sort((a, b) => d3.ascending(a.year, b.year));

  const stackedExpand = d3.stack()
    .keys(topPurpose)
    .offset(d3.stackOffsetExpand)(dataByPurpose);

  //color scale
  const color = d3.scaleOrdinal()
    .domain(topPurpose)
    .range(d3.schemeTableau10);

  // scales
  const x = d3.scaleBand()
      .domain(dataByPurpose.map(d => d.year))
      .range([0, visWidth])
      .padding(0.10);

  const y = d3.scaleLinear()
      .domain([0, 1]).nice()
      .range([visHeight, 0]);

  //axis

  const xAxis = d3.axisBottom(x);

  const yAxis = d3.axisLeft(y).tickFormat(d3.format('.0%'));

   g.append('g')
      .attr('transform', `translate(0,${visHeight})`)
      .call(xAxis)
      .call(g => g.selectAll('.domain').remove());

   //label
   g.append("g")
      .call(yAxis)
      .call(g => g.selectAll('.domain').remove())
      .append('text')
      .attr('fill', 'black')
      .attr('x', -40)
      .attr('y', visHeight / 2)
      .attr("font-size", "14px")
      .text("Percentage");

   //draw bars
   g.selectAll('.series')
      .data(stackedExpand)
      .join('g')
      .attr('fill', d => color(d.key))
      .attr('class', 'series')
      .selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('x', d => x(d.data.year))
      .attr('width', x.bandwidth());

   // add legend
   g.append(() => getCategoricalColorLegend(color))
      .attr("transform", `translate(${margin.left -100 }, -180)`)

}

function getCategoricalColorLegend(colorScale) {
  const size = 10;

  const legend = d3.create("svg:g");

  const rows = legend
    .selectAll("g")
    .data(colorScale.domain())
    .join("g")
      .attr("transform", (d, i) => `translate(0, ${i * size * 1.5})`);

  rows.append("rect")
      .attr("height", size)
      .attr("width", size)
      .attr("fill", d => colorScale(d));

  rows.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("dominant-baseline", "hanging")
      .attr("x", size * 1.5)
      .text(d => d);

  return legend.node();
}
