function vis4(data, div) {
  const margin = {top: 135, right: 20, bottom: 40, left: 200};

  const visWidth = 1300 - margin.left - margin.right;
  const visHeight = 740 - margin.top - margin.bottom;

  const svg = div.append('svg')
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // add title

  g.append("text")
    .attr("x", visWidth / 2)
    .attr("y", -margin.top + 85)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .text("Change In Net Amount Of Countries Over Years");

  const years = data.map( d=> d.year);

  const x = d3.scaleBand()
      .domain(years)
      .range([0, visWidth])
      .padding(0.05);

  const color = d3.scaleDiverging()
      .domain([-d3.max(data, d=> d.net),0,d3.max(data, d=> d.net)])
      .interpolator(d3.interpolateBrBG)

  //Legend
  var legendLinear = d3.legendColor()
  .shapeWidth(30)
  .cells(10)
  .orient('horizontal')
  .scale(color)
      .labelFormat(d3.format(".0s"))
      .shapePadding(".5")
      .title("Net Amount (G = one-thousand dollars)");

  const countries = data.map(d=> d.country);

  const y = d3.scaleBand()
      .domain(countries)
      .range([0, visHeight])
      .padding(0.05);

  // countries label

  const yAxis = d3.axisLeft(y)
      .tickPadding(10)
      .tickSize(0);

  g.append('g')
      .call(yAxis)
      .call(g => g.selectAll('.domain').remove());

  // years lable
  const xAxis = d3.axisTop(x);

  g.append('g')
      .call(xAxis)
      .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'initial')
      .call(g => g.selectAll('.domain').remove());

  //draw cells
  g.selectAll('rect')
    .data(data)
    .join('rect')
      .attr('x', d => x(d.year))
      .attr('y', d => y(d.country))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => d.net == 0 ? "#E8E8E8" : color(d.net));

  // add legend
  g.append('g').call(legendLinear).attr('transform', `translate(${margin.right},${margin.top-250})`);
}
