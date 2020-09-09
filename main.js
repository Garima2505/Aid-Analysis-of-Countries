// Load the datasets and call the functions to make the visualizations

Promise.all([
  d3.csv('data/net_amount.csv', d3.autoType),
  d3.json('data/countries.json'),
  d3.csv('data/purposes3.csv', d3.autoType),
  d3.csv('data/net_amount_data.csv', d3.autoType),
  d3.csv('data/aiddata-countries-only - aiddata-countries-only.csv', d3.autoType),
  d3.csv('data/aiddata.csv', d3.autoType),
  d3.json('data/purposeAmount.json'),
  d3.csv('data/amountByYearData.csv', d3.autoType),
]).then(([net_amount, geoJSON, purposes, net_amount_data, data_aiddata, aiddata, purposeAmount, amountByYear]) => {
  vis1(net_amount, d3.select('#vis1'));
  vis2(geoJSON, net_amount, d3.select('#vis2'));
  vis3(purposes, d3.select('#vis3'));
  vis4(net_amount_data, d3.select('#vis4'));
  vis5(data_aiddata, d3.select('#vis5'));
  vis6(aiddata, d3.select('#vis6'));
  vis7(aiddata,purposeAmount, d3.select('#vis7'));
  vis8(aiddata, amountByYear, d3.select('#vis8'));
});
