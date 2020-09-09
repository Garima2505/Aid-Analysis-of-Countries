function vis6(data, div) {
  const margin = {top: 40, right: 20, bottom: 50, left: 350};

  const visWidth = 1000 - margin.left - margin.right;
  const visHeight = 700 - margin.top - margin.bottom;

  const svg = div.append('svg')
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //data transformation

  const receiverToTotalAmount = d3.rollup(data ,amount_receive =>
      d3.sum(amount_receive.map(d => d.commitment_amount_usd_constant)),d => d.recipient);

  const topReceiver = Array.from(receiverToTotalAmount, ([receiver, amount]) => ({receiver, amount}))
    .sort((a, b) => d3.descending(a.amount, b.amount))
    .slice(0, 10).map(d=> d.receiver);

  const donarToAmountDonated = d3.rollup(data, amount_donated =>
      d3.sum(amount_donated.map(d => d.commitment_amount_usd_constant)),d => d.donor);

  const topDonar = Array.from(donarToAmountDonated, ([donar, amount]) => ({donar, amount}))
    .sort((a, b) => d3.descending(a.amount, b.amount))
    .slice(0, 20).map(d=> d.donar);

  const filterRecipient = data.filter(d => d.recipient=== topReceiver[0] || d.recipient=== topReceiver[1]
                             || d.recipient=== topReceiver[2] || d.recipient=== topReceiver[3]
                             || d.recipient=== topReceiver[4] || d.recipient=== topReceiver[5]
                             || d.recipient=== topReceiver[6] || d.recipient=== topReceiver[7]
                             || d.recipient=== topReceiver[8] || d.recipient=== topReceiver[9]);

  const filterDonor = filterRecipient.filter(d => d.donor === topDonar[0]  || d.donor === topDonar[1]
                             || d.donor === topDonar[2] || d.donor === topDonar[3]
                             || d.donor === topDonar[4] || d.donor === topDonar[5]
                             || d.donor === topDonar[6] || d.donor === topDonar[7]
                             || d.donor === topDonar[8] || d.donor === topDonar[9]
                             || d.donor === topDonar[10] || d.donor === topDonar[11]
                             || d.donor === topDonar[12] || d.donor === topDonar[13]
                             || d.donor === topDonar[14] || d.donor === topDonar[15]
                             || d.donor === topDonar[16] || d.donor === topDonar[17]
                             || d.donor === topDonar[18] || d.donor === topDonar[19]);

  const amountDonated = d3.rollup(filterDonor,amount_donated =>
                                  d3.sum(amount_donated.map(d=>d.commitment_amount_usd_constant)),
                                  d => d.donor, d=> d.recipient);

  const donatedAmountByCountry = Array.from(amountDonated, ([donar, total_amount]) => ({
    donar: donar,
    total_amount : Array.from(total_amount, ([receiver, amount]) => ({receiver, amount}))
  }));

  const maxAmount = d3.max(donatedAmountByCountry.map(d => d3.max(d.total_amount.map(t => t.amount))));

  // create scales

  const x = d3.scalePoint()
      .domain(topReceiver)
      .range([0, visWidth])
      .padding(0.5);

  const y = d3.scalePoint()
      .domain(topDonar)
      .range([0, visHeight])
      .padding(0.1);

  const maxRadius = 16;
  const radius = d3.scaleSqrt()
      .domain([0, maxAmount])
      .range([0, maxRadius]);


  // add legend
  const format = d3.format(".2s");

  const legend = g.append("g")
      .attr("transform", `translate(${visWidth + margin.right - 50}, 0)`)
    .selectAll("g")
    .data([10000000000, 20000000000, 30000000000, 50000000000])
    .join("g")
      .attr("transform", (d, i) => `translate(0, ${i * 2.5 * maxRadius})`);

  legend.append("circle")
    .attr("r", d => radius(d))
    .attr("fill", "steelblue");

  legend.append("text")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("dominant-baseline", "middle")
    .attr("x", maxRadius + 5)
    .text(format);

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
      .text("Donar");

  // draw points

  const rows = g.selectAll(".row")
    .data(donatedAmountByCountry)
    .join("g")
      .attr("transform", d => `translate(0, ${y(d.donar)})`);

   rows.selectAll("circle")
    .data(d=> d.total_amount)
    .join("circle")
      .attr("cx", d => x(d.receiver))
      .attr("cy", d => 0)
      .attr("fill", "steelblue")
      .attr("r", d => radius(d.amount));

  // add title

  g.append("text")
    .attr("x", visWidth / 2)
    .attr("y", -margin.top)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .text("Top 10 Recipients & Top 20 Donors");


}
