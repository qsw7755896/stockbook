var barCount = 60;
var initialDateStr = '01 Apr 2017 00:00 Z';
var chartlist = [];
var color = ["rgb(255, 99, 132)", "rgb(255, 99, 132)"];

var socket = io.connect();
socket.on('priceSet', function (val) {
	console.log('val', val);
	var html = "<div style=\"width: 75%\" href=\"/stockDetail/" + val[0].stockNum + "\">" +
		"<canvas id=\"" + val[0].stockNum + "\" class=\"chart\"></canvas></div>"
	//"<script type=\"text/javascript\" src=\"/javascripts/priceValue/index.js\"></script>"
	$("div.priceValue").append(html);
	var ctx = $("div.priceValue div canvas#" + val[0].stockNum).get(0).getContext('2d');
	var color = Chart.helpers.color;
	var chart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: [val[0].date.substring(6, 8), val[1].date.substring(6, 8), val[2].date.substring(6, 8), val[3].date.substring(6, 8), val[4].date.substring(6, 8), val[5].date.substring(6, 8), val[6].date.substring(6, 8)],
			datasets: [{
				label: val[0].stockNum + val[0].stockName + " - 損益",
				fill: false,
				backgroundColor: "#33A1C9",
				borderColor: "#33A1C9",
				borderWidth: 3,
				data: [
					calculate(val[0].cost, val[0].strikePrice),
					calculate(val[1].cost, val[1].strikePrice),
					calculate(val[2].cost, val[2].strikePrice),
					calculate(val[3].cost, val[3].strikePrice),
					calculate(val[4].cost, val[4].strikePrice),
					calculate(val[5].cost, val[5].strikePrice),
					calculate(val[6].cost, val[6].strikePrice)
				]
			}]
		},
		options: {
			responsive: true,
			legend: {
				position: 'top',
			},
			title: {
				display: true,
			},
			onClick: function(e){
				console.log('hi',$(this.canvas).attr("id"));
				window.location.href = '/stockDetail/' + $(this.canvas).attr("id");
			}

			// annotation: {
			// 	events: [""],
			// 	annotations: [
			// 		{
			// 			drawTime: "afterDatasetsDraw",
			// 			id: "hline",
			// 			type: "line",
			// 			mode: "horizontal",
			// 			scaleID: "y-axis-0",
			// 			value: val[0].cost,
			// 			borderColor: "red",
			// 			borderWidth: 2.5,
			// 			label: {
			// 				backgroundColor: "red",
			// 				content: "購入$" + val[0].cost,
			// 				enabled: true
			// 			},
			// 			onClick: function (e) {
			// 				// The annotation is is bound to the `this` variable
			// 				console.log("Annotation", e.type, this);
			// 			}
			// 		}
			// 	]
			// }
		}
	});
	chartlist.push(chart);
});


var calculate = function (cost, price) {
	var costfee = cost * 0.001425;
	if (costfee < 20) costfee = 20;
	var pricefee = price * 0.001425;
	if (pricefee < 20) pricefee = 20;
	var taxes = price * 0.003;

	return (price * 1000) - (cost * 1000) - costfee - pricefee - taxes;
}