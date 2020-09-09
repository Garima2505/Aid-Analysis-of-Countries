function vis1(data, div) {
  const margin = {top: 10, right: 20, bottom: 20, left: 300};

  const visWidth = 1000- margin.left - margin.right;
  const visHeight = 600 - margin.top - margin.bottom;

  const svg = div.append('svg')
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // add title

  g.append("text")
    .attr("x", visWidth / 2)
    .attr("y", margin.bottom-30)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .text("Amount Donated and Received by the Countries");
  // create scale

  const maxValue = d3.max([d3.max(data, d => d.Donated_Amount), d3.max(data, d => d.Received_Amount)])

  const xDonate = d3.scaleLinear()
    .domain([0, maxValue]).nice()
    .range([visWidth/2, 0]);

  const xReceive = d3.scaleLinear()
      .domain([0,maxValue]).nice()
      .range([visWidth/2, visWidth-margin.right]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.Country))
    .range([visHeight - margin.bottom, margin.top])
    .padding(0.2);

  const color = d3.scaleOrdinal()
      .domain(['Donated', 'Received'])
      .range(d3.schemeCategory10);

  // create and add axes
    const xAxis = g => g
    .attr("transform", `translate(0,${visHeight - margin.bottom})`)
    .call(g => g.append("g").call(d3.axisBottom(xDonate).ticks(visWidth / 80, "s")))
    .call(g => g.append("g").call(d3.axisBottom(xReceive).ticks(visWidth / 80, "s")))
    .call(g => g.selectAll(".domain").remove())
    .call(g => g.selectAll(".tick:first-of-type").remove())
    .append("text")
    .attr("x", visWidth / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Amount");

  g.append("g")
      .call(xAxis);

  const yAxis = d3.axisLeft(y);

  g.append("g")
    .call(yAxis)
    .call(g => g.selectAll(".domain").remove());

  // draw bars

  g.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => xDonate(d.Donated_Amount))
    .attr("y", d => y(d.Country))
    .attr("width", d => xDonate(0) - xDonate(d.Donated_Amount))
    .attr("height", d => y.bandwidth())
    .attr("fill", color('Donated'));


  g.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
      .attr("x", d => xReceive(0))
      .attr("y", d => y(d.Country))
      .attr("width", d => xReceive(d.Received_Amount)-xReceive(0))
      .attr("height", d => y.bandwidth())
      .attr("fill", color('Received'));



  g.append(() => getCategoricalColorLegend(color))
      .attr("transform", `translate(${margin.left + visWidth - 350}, 0)`)

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

