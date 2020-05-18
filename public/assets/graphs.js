console.log("charts here");

//Getting the question number from pathname
let questionNumber = window.location.pathname;
questionNumber = parseInt(questionNumber[questionNumber.length - 1]);
console.log(questionNumber);

let newY = 0;
let newX = 0;
let labels = [
  "2014-15",
  "2015-16",
  "2016-17",
  "2017-18",
  "2018-19",
  "2019-20",
  "",
];

//Function to go to the next question or submit the data
const nextQuestion = async () => {
  if (questionNumber === 2) {
    const res = await axios.post("/submit");
    console.log(res.data);
    window.location.replace("/");
  } else {
    window.location.replace(`/question${questionNumber + 1}`);
  }
};

//Function to show the result to the user
const showResult = (res) => {
  if (res.data.okay) {
    document.getElementById(
      "result"
    ).innerHTML = `<p style="font-weight:bold; color:green;">${res.data.message}</p>`;
  } else {
    document.getElementById(
      "result"
    ).innerHTML = `<p style="font-weight:bold; color:red;">${res.data.message}. The correct answer is ${res.data.correct}</p>`;
  }
  setTimeout(nextQuestion, 2000);
};

//Dataset matrix
const graphValues = [
  [289, 306, 332, 361, 384, 384],
  [289, 306, 332, 361, 384, 384],
];

//Function to re-render chart based on click
const chartClicked = async (event) => {
  clicked = true;

  let yTop = myChart.chartArea.top;
  let yBottom = myChart.chartArea.bottom;

  let yMin = myChart.scales["y-axis-0"].min;
  let yMax = myChart.scales["y-axis-0"].max;

  if (event.offsetY <= yBottom && event.offsetY >= yTop) {
    newY = Math.abs((event.offsetY - yTop) / (yBottom - yTop));
    newY = (newY - 1) * -1;
    newY = newY * Math.abs(yMax - yMin) + yMin;
  }

  let xTop = myChart.chartArea.left;
  let xBottom = myChart.chartArea.right;
  let xMin = myChart.scales["x-axis-0"].min;
  let xMax = myChart.scales["x-axis-0"].max;

  if (event.offsetX <= xBottom && event.offsetX >= xTop) {
    newX = Math.abs((event.offsetX - xTop) / (xBottom - xTop));
    newX = newX * Math.abs(xMax - xMin) + xMin;
  }

  const selectedVal = Math.ceil(newY / 10) * 10;
  myChart.data.datasets[0].data.pop();
  myChart.data.datasets[0].data.push(selectedVal);
  console.log(labels);

  myChart.update();
  const res = await axios.get("/check", {
    params: { level: questionNumber, value: selectedVal },
  });
  console.log(res.data);
  showResult(res);
};

document.getElementById(
  "questionNumber"
).innerHTML = `Q.${questionNumber}  :  What is the budget for XYZ in 2020 for your state?`;
const canvasRef = document.getElementById("myChart");
let ctx = canvasRef.getContext("2d");
var gradient = null;
var width = null;
var height = null;

var gradientStroke = ctx.createLinearGradient(1585, 0, 100, 0);
gradientStroke.addColorStop(0, "#ff471a");
gradientStroke.addColorStop(0.5, "#ff471a");
gradientStroke.addColorStop(0.5, "#fcbf1e");
gradientStroke.addColorStop(1, "#fcbf1e");
let draw = Chart.controllers.line.prototype.draw;
Chart.controllers.line = Chart.controllers.line.extend({
  draw: function () {
    draw.apply(this, arguments);
    let ctx = this.chart.chart.ctx;
    let _stroke = ctx.stroke;
    ctx.stroke = function () {
      ctx.save();
      ctx.shadowColor = "#394052";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 10;
      _stroke.apply(this, arguments);
      ctx.restore();
    };
  },
});

let myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Budget",
        //Using question number as index to use from dataset matrix
        data: graphValues[questionNumber - 1],
        backgroundColor: "transparent",
        borderColor: function (myChart) {
          var chartArea = myChart.chart.chartArea;
          if (!chartArea) {
            // This case happens on initial chart load
            return null;
          }
          var chartWidth = chartArea.right - chartArea.left;
          var chartHeight = chartArea.bottom - chartArea.top;

          if (
            gradient === null ||
            width !== chartWidth ||
            height !== chartHeight
          ) {
            // Create the gradient because this is either the first render
            // or the size of the chart has changed
            width = chartWidth;
            height = chartHeight;
            var ctx = myChart.chart.ctx;
            gradient = ctx.createLinearGradient(
              chartArea.left,
              0,
              chartArea.right,
              0
            );

            gradient.addColorStop(0, "yellow");
            gradient.addColorStop(0.67, "yellow");
            gradient.addColorStop(0.67, "red");
            gradient.addColorStop(1, "red");
          }

          return gradient;
        },
        borderWidth: 4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "yellow",
        pointBorderColor: gradientStroke,
        pointHoverBackgroundColor: "blue",
        pointHoverBorderColor: gradientStroke,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,

    dragData: true,
    dragX: true,
    dragDataRound: -1,
    onDragStart: (e) => {
      console.log(e);
    },
    onDrag: (e, datasetIndex, index, value) => {
      e.target.style.cursor = "grabbing";
    },
    //Function to check if answer is correct or incorrect when user stops the drag
    onDragEnd: async (e, datasetIndex, index, value) => {
      e.target.style.cursor = "default";
      const res = await axios.get("/check", {
        params: { level: questionNumber, value },
      });
      showResult(res);
    },

    elements: {
      line: {
        tension: 0,
        spanGaps: true,
      },
    },
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Budget (in Lakh)",
            fontColor: "black",
            fontSize: 20,
            color: "black",
          },
          ticks: {
            beginAtZero: true,
            max: 500,
            min: 200,
            fontColor: "black",
            color: "black",
          },
          gridLines: {
            zeroLineColor: "black",
            display: true,
            fontColor: "black",
            color: "black",
          },
          label: "Budget (in Lakh)",
        },
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Year",
            fontColor: "black",
            fontSize: 20,
            color: "black",
          },
          ticks: {
            beginAtZero: false,
            fontColor: "black",
          },
          gridLines: {
            zeroLineColor: "black",
            display: true,
            fontColor: "black",
            color: "black",
          },
        },
      ],
    },
  },
});
