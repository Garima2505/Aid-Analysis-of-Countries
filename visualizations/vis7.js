function vis7(data, purposeAmount, div) {
  const margin = {top: 20, right: 300, bottom: 50, left: 220};

  const visWidth = 1400 - margin.left - margin.right;
  const visHeight = 750 - margin.top - margin.bottom;

  const svg = div.append('svg')
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  //data transformation

  //data transformation
  const receiverToTotalAmount = d3.rollup(data,amount_receive => d3.sum(amount_receive.map(d => d.commitment_amount_usd_constant)),d => d.recipient);

  const topReceiver = Array.from(receiverToTotalAmount, ([receiver, amount]) => ({receiver, amount}))
    .sort((a, b) => d3.descending(a.amount, b.amount))
    .slice(0, 10).map(d=> d.receiver);

  const donarToAmountDonated = d3.rollup(data,amount_donated => d3.sum(amount_donated.map(d => d.commitment_amount_usd_constant)),d => d.donor);

  const topDonar = Array.from(donarToAmountDonated, ([donar, amount]) => ({donar, amount}))
    .sort((a, b) => d3.descending(a.amount, b.amount))
    .slice(0, 20).map(d=> d.donar);

  const purposeToAmount = d3.rollup(data,
                            amount_donated => d3.sum(amount_donated.map(d=> d.commitment_amount_usd_constant)),
                            d => d.coalesced_purpose_name);

  const topPurposes = Array.from(purposeToAmount, ([purpose, amount]) => ({purpose, amount}))
    .sort((a, b) => d3.descending(a.amount, b.amount))
    .slice(0, 5).map(d=> d.purpose);

  // create scales

  const x = d3.scalePoint()
      .domain(topReceiver)
      .range([0, visWidth])
      .padding(0.5);

  const y = d3.scalePoint()
      .domain(topDonar)
      .range([0, visHeight])
      .padding(0.5);

  //add axis
  const xAxis = d3.axisBottom(x);

  g.append("g")
      .attr("transform", `translate(0, ${visHeight})`)
      .call(xAxis)
      .call(g => g.selectAll(".domain").remove())
    .append("text")
      .attr("x", visWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Recipient");

  const yAxis = d3.axisLeft(y);

  g.append("g")
      .call(yAxis)
      .call(g => g.selectAll(".domain").remove())
    .append("text")
      .attr("x", -65)
      .attr("y", visHeight / 2)
      .attr("fill", "black")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "14px")
      .text("Donor");

  // the radius of the pie charts
  const outerRadius = x.step() / 5.5;

    const pie = d3.pie()
      .value(d => d.amount);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(outerRadius);

  const color = d3.scaleOrdinal()
    .domain(topPurposes)
    .range(d3.schemeTableau10);

  const pieGroups = g.selectAll('.pieGroup')
    .data(purposeAmount)
    .join('g')
      .attr('class', 'pieGroup')
      .attr('transform', d => `translate(${x(d.receiver)},${y(d.donar)})`);

  pieGroups.selectAll('path')
    .data(d => pie(d.purposes))
    .join('path')
      .attr('d', d => arc(d))
      .attr('fill', d => color(d.data.purpose));


  // add title

  g.append("text")
    .attr("x", visWidth / 2)
    .attr("y", -margin.top+1)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .text("Top 10 Recipients & Top 20 Donors With Top 5 Purposes");

  //add legend
  g.append(() => getCategoricalColorLegend(color))
      .attr("transform", `translate(${visWidth +30}, 30)`);
  g.append("text")
    .attr("x", visWidth+60)
    .attr("y", -margin.top+30)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .text("Purposes");

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
