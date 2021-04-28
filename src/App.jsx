import React, { useState, useEffect } from "react";
import callAPI from "./utils";

function App() {
	const [isLoading, setIsLoading] = useState(true);
	const [latestPrice, setLatestPrice] = useState(0);

	useEffect(() => {
		fetchData().then((chartData) => {
			setIsLoading(false);
			initChart(chartData);
			setLatestPrice(parseFloat(chartData.price[chartData.price.length - 1]).toFixed(2));
		});
		const timerID = setInterval(() => {
			fetchData().then((chartData) => {
				updateChart(chartData);
				setLatestPrice(parseFloat(chartData.price[chartData.price.length - 1]).toFixed(2));
			});
		}, 1000 * 30);
		return () => {
			clearInterval(timerID);
		};
	}, []);

	const fetchData = async () => {
		let data = { index: [], price: [], volumes: [] };
		let result = await callAPI("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1&interval=1m");
		for (const item of result.prices) {
			data.index.push(item[0]);
			data.price.push(item[1]);
		}
		for (const item of result.total_volumes) data.volumes.push(item[1]);
		return data;
	};

	const initChart = (data) => {
		let trace_price = {
			name: "Price ($)",
			x: data.index.map((t) => new Date(t)),
			y: data.price,
			xaxis: "x",
			yaxis: "y1",
			type: "scatter",
			mode: "lines+markers",
			marker: { color: "blue", size: 3 },
		};
		let trace_volumes = {
			name: "Volumne ($B)",
			x: data.index.map((t) => new Date(t)),
			y: data.volumes,
			xaxis: "x",
			yaxis: "y2",
			type: "bar",
			barmode: "relative",
			marker: {
				color: "rgb(49,130,189)",
				opacity: 0.7,
			},
		};
		let layout = {
			autosize: true,
			height: "100%",
			margin: {
				l: 50,
				r: 20,
				t: 35,
				pad: 3,
			},
			showlegend: false,
			xaxis: {
				domain: [1, 1],
				anchor: "y2",
			},
			yaxis: {
				domain: [0.1, 1],
				anchor: "x",
			},
			yaxis2: {
				showticklabels: false,
				domain: [0, 0.1],
				anchor: "x",
			},
			grid: {
				roworder: "bottom to top",
			},
		};
		let config = { responsive: true };
		let series = [trace_price, trace_volumes];
		Plotly.newPlot("chart", series, layout, config);
	};

	const updateChart = (data) => {
		document.querySelector("#last-price").classList.remove("animate__fadeIn");
		let trace_price = {
			x: [data.index.map((t) => new Date(t))],
			y: [data.price],
		};
		let trace_volumes = {
			x: [data.index.map((t) => new Date(t))],
			y: [data.volumes],
		};

		Plotly.update("chart", trace_price, {}, 0);
		Plotly.update("chart", trace_volumes, {}, 1);
		document.querySelector("#last-price").classList.add("animate__fadeIn");
	};

	return (
		<div className='px-3 mt-1'>
			{isLoading ? (
				<h6 className='value animate__animated animate__flash animate__slow text-center text-primary'> loading ...</h6>
			) : (
				<>
					<h2 id='last-price' className='text-center text-primary animate__animated'>
						$ {latestPrice}
					</h2>
					<div id='chart' className='p-0 m-0'></div>
				</>
			)}
		</div>
	);
}

export default App;
