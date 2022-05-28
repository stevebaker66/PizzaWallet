import { Line } from "react-chartjs-2";
import { useMoralis } from "react-moralis";
import { Spin } from "antd";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
let io = require("socket.io-client");

const BASE_URL = "wss://api-v4.zerion.io/";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Tooltip,
);

// function verify(request, response) {
//   // each value in request payload must be found in response meta
//   return Object.keys(request.payload).every((key) => {
//     const requestValue = request.payload[key];
//     const responseMetaValue = response.meta[key];
//     if (typeof requestValue === "object") {
//       return JSON.stringify(requestValue) === JSON.stringify(responseMetaValue);
//     }
//     return responseMetaValue === requestValue;
//   });
// }

function getGradient(ctx, chartArea, data, scales) {
  const { bottom } = chartArea;
  const { y } = scales;
  const gradientBorder = ctx.createLinearGradient(0, 0, 0, bottom);
  const shift = y.getPixelForValue(data.datasets[0].data[0]) / bottom;
  if (shift && shift > 0 && shift < 1) {
    gradientBorder.addColorStop(0, "rgba(75, 192, 192, 1)");
    gradientBorder.addColorStop(shift, "rgba(75, 192, 192, 1)");
    gradientBorder.addColorStop(shift, "rgba(255, 26, 104, 1)");
    gradientBorder.addColorStop(1, "rgba(255, 26, 104, 1)");
  }
  return gradientBorder;
}

function belowGradient(ctx, chartArea, data, scales) {
  if (data.datasets[0].data[0] != null) {
    const { bottom } = chartArea;
    const { y } = scales;
    const gradientBackground = ctx.createLinearGradient(
      0,
      y.getPixelForValue(data.datasets[0].data[0]),
      0,
      bottom,
    );
    gradientBackground.addColorStop(0, "rgba(255, 26, 104, 0.2)");
    gradientBackground.addColorStop(1, "rgba(255, 26, 104, 0.8)");
    return gradientBackground;
  }
}

function aboveGradient(ctx, chartArea, data, scales) {
  if (data.datasets[0].data[0] != null) {
    const { top } = chartArea;
    const { y } = scales;
    const gradientBackground = ctx.createLinearGradient(
      0,
      y.getPixelForValue(data.datasets[0].data[0]),
      0,
      top,
    );
    gradientBackground.addColorStop(0, "rgba(75, 192, 192, 0.2)");
    gradientBackground.addColorStop(1, "rgba(75, 192, 192, 0.8)");
    return gradientBackground;
  }
}

const dottedLine = {
  id: "dottedLine",
  beforeDatasetsDraw(chart) {
    const {
      ctx,
      data,
      chartArea: { left, right },
      scales: { y },
    } = chart;

    if (data.datasets[0].data[0] != null) {
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.setLineDash([1, 4]);
      ctx.strokeStyle = "rgba(102, 102, 102, 0.6)";
      ctx.moveTo(left, y.getPixelForValue(data.datasets[0].data[0]));
      ctx.lineTo(right, y.getPixelForValue(data.datasets[0].data[0]));
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);
    }
  },
};

const addressSocket = {
  namespace: "address",
  socket: io(`${BASE_URL}address`, {
    transports: ["websocket"],
    timeout: 60000,
    query: {
      api_token: "Demo.ukEVQp6L5vfgxcz4sBke7XvS873GMYHy",
    },
  }),
};

function get(socketNamespace, requestBody) {
  return new Promise((resolve) => {
    const { socket, namespace } = socketNamespace;
    function handleReceive(data) {
      {
        unsubscribe();
        resolve(data);
      }
    }
    const model = requestBody.scope[0];
    function unsubscribe() {
      socket.off(`received ${namespace} ${model}`, handleReceive);
      socket.emit("unsubscribe", requestBody);
    }
    socket.emit("get", requestBody);
    socket.on(`received ${namespace} ${model}`, handleReceive);
  });
}

function Portfolio() {
  let [dataset, setDataset] = useState([]);
  let [timeStamps, setTimeStamps] = useState([]);
  let [values, setValues] = useState([]);
  let [isLoading, setIsLoading] = useState(false);
  const { account } = useMoralis();

  useEffect(() => {
    async function fetcher() {
      setIsLoading(true);
      const fetcher = await get(addressSocket, {
        scope: ["charts"],
        payload: {
          address: `${account}`,
          currency: "usd",
          charts_max_assets: 0,
          charts_min_percentage: 100,
          charts_type: "d",
        },
      });
      const result = await fetcher;
      //   console.log(result.payload.charts.others);
      await setDataset(result.payload.charts.others);
      setIsLoading(false);
    }
    fetcher();
  }, [account]);

  let _timeStamps = [];
  let _values = [];

  function separator(item) {
    _timeStamps.push(
      new Date(item[0] * 1000).toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
    _values.push(item[1]);
  }

  useEffect(() => {
    dataset.map(separator);
    setTimeStamps(_timeStamps.reverse());
    setValues(_values.reverse());
  }, [dataset]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <Line
        data={{
          labels: timeStamps,
          datasets: [
            {
              label: "Portfolio Value",
              data: values,
              pointRadius: 0.1,
              pointHitRadius: 100,
              tension: 0.8,
              borderWidth: 1,
              parsing: {
                yAxisKey: "0",
              },
              borderColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea, data, scales } = chart;
                if (!chartArea) {
                  return null;
                }
                return getGradient(ctx, chartArea, data, scales);
              },
              fill: {
                target: {
                  value: values[0],
                },
                above: (context) => {
                  const chart = context.chart;
                  const { ctx, chartArea, data, scales } = chart;
                  if (!chartArea) {
                    return null;
                  }
                  return aboveGradient(ctx, chartArea, data, scales);
                },
                below: (context) => {
                  const chart = context.chart;
                  const { ctx, chartArea, data, scales } = chart;
                  if (!chartArea) {
                    return null;
                  }
                  return belowGradient(ctx, chartArea, data, scales);
                },
              },
            },
          ],
        }}
        height={250}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            title: {
              display: true,
              text:
                values != null
                  ? `Portfolio Value $ ${values[values.length - 1]?.toFixed(2)}`
                  : "(no values found)",
              color: "#fff",
            },
          },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        }}
        plugins={[dottedLine]}
      />
    </div>
  );
}

export default Portfolio;
