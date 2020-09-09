function vis3(dataByCountry, div) {
  const margin = {top: 10, right: 20, bottom: 50, left: 300};

  const visWidth = 1000- margin.left - margin.right;
  const visHeight = 600 - margin.top - margin.bottom;

  const svg = div.append('svg')
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const series = d3.stack().keys(dataByCountry.columns.slice(1))(dataByCountry);

  //text
    g.append("text")
    .attr("x", visWidth / 2)
    .attr("y", margin.bottom-25)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .text("Top 5 Purposes of Disbursements");

    const xScale = d3.scaleBand()
    .domain(dataByCountry.map(function(d){return d.Country;}))
    .range([0, visWidth])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0,d3.max(series, d => d3.max(d, d=> d[1]))])
    .range([visHeight,0]);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const rects = g.selectAll("g").data(series).enter()
    .append("g")
    .attr("fill", d => d.key ==='Country'? 'None' : color(d.key));

  rects.selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", (d, i) => xScale(d.data.Country))
    .attr("y", d=> yScale(d[1]))
    .attr("height", d=> yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth());

  const xAxis = g.append("g")
    .attr("id", "xAxis")
    .attr("transform", "translate(0,"+visHeight+")")
    .call(d3.axisBottom(xScale));

  const yAxis = g.append("g")
    .attr("id", "yAxis")
    .call(d3.axisLeft(yScale))
      .append('text')
      .attr('fill', 'black')
      .attr('x', -100)
      .attr('y', visHeight / 2)
      .attr("font-size", "16px")
      .text('Amount');

    g.append(() => getCategoricalColorLegend(color))
      .attr("transform", `translate(${visWidth - 160}, 0)`)

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

