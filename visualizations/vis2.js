function vis2(geoJSON, data, div) {

  const margin = {top: 20, right: 20, bottom: 20, left: 100};

  const visWidth = 1200 - margin.left - margin.right;
  const visHeight = 800 - margin.top - margin.bottom;

  const svg = div.append('svg')
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // create scale
  const maxVal = d3.max([d3.max(data, d => d.Donated_Amount), d3.max(data, d => d.Received_Amount)]);
  const maxRadius = 25;
  const radius = d3.scaleSqrt()
      .domain([0, maxVal])
      .range([0, maxRadius]);

  const color = d3.scaleOrdinal()
      .domain(['Donated', 'Received'])
      .range(d3.schemeCategory10);


    // draw map

  const projection =  d3.geoNaturalEarth1()
      .fitSize([visWidth, visHeight], geoJSON);

  const path = d3.geoPath().projection(projection);

  const features = geoJSON.features.filter(d => d.properties.NAME);

  const countryToDonation = Object.fromEntries(new Map(data.map(d => [d.Country, d.Donated_Amount])));

  const countryToReceive = Object.fromEntries(new Map(data.map(d => [d.Country, d.Received_Amount])));

  g.selectAll('.border')
    .data(features)
    .join('path')
      .attr('class', 'border')
      .attr('d', path)
      .attr('fill', '#dcdcdc')
      .attr('stroke', 'white');

    // draw circles

  g.selectAll("dot")
    .data(features)
    .join("circle")
      .attr("class", ".dot")
      .attr("fill", color('Donated'))
      .attr("fill-opacity", 0.75)
      .attr("cx", d => {
        const [x, y] = path.centroid(d);
        return x;
      })
      .attr("cy", d => {
        const [x, y] = path.centroid(d);
        return y;
      })
      .attr("r", d => radius(countryToDonation[d.properties.NAME]));

    g.selectAll("dot")
    .data(features)
    .join("circle")
      .attr("class", ".dot")
      .attr("fill", color('Received'))
      .attr("fill-opacity", 0.75)
      .attr("cx", d => {
        const [x, y] = path.centroid(d);
        return x;
      })
      .attr("cy", d => {
        const [x, y] = path.centroid(d);
        return y;
      })
      .attr("r", d => radius(countryToReceive[d.properties.NAME]));

  // title
  g.append('text')
      .attr('class', 'title')
      .attr('x', (visWidth / 2)-100)
      .attr('y', margin.bottom)
      .text('Amount Donated & Received by the Countries');

  g.append(() => getCategoricalColorLegend(color))
      .attr("transform", `translate(${visWidth - 70}, 50)`)
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