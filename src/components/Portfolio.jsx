import { Line } from "react-chartjs-2";
import { useMoralis } from "react-moralis";
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
  const { account } = useMoralis();

  useEffect(() => {
    async function fetcher() {
      const fetcher = await get(addressSocket, {
        scope: ["charts"],
        payload: {
          address: account | "0x5130049EFC9faA0671f0fD1c4e17d54E4b9a193b",
          currency: "usd",
          charts_max_assets: 0,
          charts_min_percentage: 100,
          charts_type: "d",
        },
      });
      const result = await fetcher;
      console.log(result);
      //   console.log(result.payload.charts.others);
      await setDataset(result.payload.charts.others);
    }
    fetcher();
  }, []);

  let _timeStamps = [];
  let _values = [];

  function separator(item) {
    _timeStamps.push(
      new Date(item[0] * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    _values.push(item[1]);
  }

  useEffect(() => {
    dataset.map(separator);
    setTimeStamps(_timeStamps);
    setValues(_values);
  }, [dataset]);

  return (
    <div>
      <Line
        data={{
          labels: timeStamps,
          datasets: [
            {
              label: "ETH Portfolio Value",
              data: values,
              parsing: {
                yAxisKey: "0",
              },
              backgroundColor: ["rgba(0, 99, 232, 0.6)"],
              showLine: "false",
              fill: {
                target: "origin",
                above: "rgba(0, 80, 250, 0.4)", // Area will be red above the origin
                below: "rgb(0, 0, 255)", // And blue below the origin
              },
            },
          ],
        }}
        height={200}
        width={200}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "ETH Portfolio Value (USD)",
              color: "#fff",
            },
          },
          scales: {
            x: { display: false },
          },
        }}
      />
    </div>
  );
}

export default Portfolio;
