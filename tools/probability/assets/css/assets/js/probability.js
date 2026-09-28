let distributionChart = null;


/* =====================================
   DOM
===================================== */

const probabilityInput =
  document.getElementById("probability");

const trialsInput =
  document.getElementById("trials");

const simulationsInput =
  document.getElementById("simulations");

const runButton =
  document.getElementById("runButton");

const operationPreview =
  document.getElementById("operationPreview");



/* =====================================
   FORMAT
===================================== */

function formatNumber(value) {

  return Number(value)
    .toLocaleString("ja-JP");

}



/* =====================================
   PRESETS
===================================== */

document
  .querySelectorAll(".preset")
  .forEach(button => {


    button.addEventListener(
      "click",
      () => {


        document
          .querySelectorAll(".preset")
          .forEach(item =>
            item.classList.remove("active")
          );


        button.classList.add("active");


        probabilityInput.value =
          button.dataset.value;


      }
    );


  });



/* =====================================
   PREVIEW
===================================== */

function updatePreview() {

  const trials =
    Number(trialsInput.value) || 0;


  const simulations =
    Number(simulationsInput.value) || 0;


  const operations =
    trials * simulations;


  operationPreview.textContent =
    formatNumber(operations);

}


trialsInput.addEventListener(
  "input",
  updatePreview
);


simulationsInput.addEventListener(
  "input",
  updatePreview
);


updatePreview();



/* =====================================
   START
===================================== */

runButton.addEventListener(
  "click",
  startSimulation
);



function startSimulation() {

  const denominator =
    Number(probabilityInput.value);


  const trials =
    Number(trialsInput.value);


  const simulations =
    Number(simulationsInput.value);


  if (
    !Number.isFinite(denominator) ||
    !Number.isFinite(trials) ||
    !Number.isFinite(simulations) ||
    denominator <= 0 ||
    trials <= 0 ||
    simulations <= 0
  ) {

    alert(
      "正しい数値を入力してください。"
    );

    return;

  }


  const operations =
    trials * simulations;


  if (
    operations > 50000000
  ) {

    const result =
      confirm(
        "総試行回数が5,000万回を超えています。\n端末によっては処理に時間がかかります。\n\n実行しますか？"
      );


    if (!result) {
      return;
    }

  }


  runButton.disabled =
    true;


  runButton.innerHTML =
    "計算しています…";


  setTimeout(
    () => {

      runSimulation(
        denominator,
        trials,
        simulations
      );


      runButton.disabled =
        false;


      runButton.innerHTML =
        `
        <span class="play-icon">▶</span>
        シミュレーション開始
        `;


      document
        .getElementById("results")
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });


    },
    50
  );

}



/* =====================================
   SIMULATION
===================================== */

function runSimulation(
  denominator,
  trials,
  simulations
) {

  const probability =
    1 / denominator;


  let totalWins =
    0;


  let overallMaxMiss =
    0;


  const winCounts =
    [];


  const history =
    [];


  for (
    let simulation = 0;
    simulation < simulations;
    simulation++
  ) {


    let wins =
      0;


    let currentMiss =
      0;


    let maxMiss =
      0;


    for (
      let trial = 0;
      trial < trials;
      trial++
    ) {


      if (
        Math.random() <
        probability
      ) {

        wins++;

        currentMiss =
          0;


      } else {


        currentMiss++;


        if (
          currentMiss >
          maxMiss
        ) {

          maxMiss =
            currentMiss;

        }

      }

    }


    totalWins +=
      wins;


    winCounts.push(
      wins
    );


    if (
      maxMiss >
      overallMaxMiss
    ) {

      overallMaxMiss =
        maxMiss;

    }


    if (
      history.length < 20
    ) {

      history.push({

        number:
          simulation + 1,

        trials:
          trials,

        wins:
          wins,

        maxMiss:
          maxMiss,

        actualProbability:
          wins > 0
            ? trials / wins
            : null

      });

    }

  }


  calculateResults(
    denominator,
    trials,
    simulations,
    totalWins,
    overallMaxMiss,
    winCounts,
    history
  );

}



/* =====================================
   CALCULATE RESULTS
===================================== */

function calculateResults(
  denominator,
  trials,
  simulations,
  totalWins,
  overallMaxMiss,
  winCounts,
  history
) {


  const probability =
    1 / denominator;


  const totalTrials =
    trials * simulations;


  const expectedWins =
    totalTrials *
    probability;


  const averageWins =
    totalWins /
    simulations;


  const actualProbability =
    totalWins > 0
      ? totalTrials / totalWins
      : null;


  const difference =
    totalWins -
    expectedWins;


  const errorRate =
    expectedWins > 0
      ?
      Math.abs(difference)
      /
      expectedWins
      *
      100
      :
      0;


  const missProbability =
    Math.pow(
      1 - probability,
      trials
    );


  const hitProbability =
    1 - missProbability;


  displayResults({

    totalTrials,
    totalWins,
    actualProbability,
    overallMaxMiss,
    expectedWins,
    averageWins,
    difference,
    errorRate,
    hitProbability,
    missProbability

  });


  renderHistory(
    history
  );


  renderDistributionChart(
    winCounts
  );

}



/* =====================================
   DISPLAY
===================================== */

function displayResults(data) {


  document
    .getElementById("totalTrials")
    .textContent =
      formatNumber(
        data.totalTrials
      );


  document
    .getElementById("totalWins")
    .textContent =
      formatNumber(
        data.totalWins
      );


  document
    .getElementById("actualProbability")
    .textContent =
      data.actualProbability
        ?
        "1 / "
        +
        data.actualProbability.toFixed(2)
        :
        "当選なし";


  document
    .getElementById("maxMiss")
    .textContent =
      formatNumber(
        data.overallMaxMiss
      );


  document
    .getElementById("expectedWins")
    .textContent =
      data.expectedWins.toFixed(2);


  document
    .getElementById("averageWins")
    .textContent =
      data.averageWins.toFixed(2);


  document
    .getElementById("chartAverage")
    .textContent =
      data.averageWins.toFixed(2)
      +
      " 回";


  const differenceElement =
    document.getElementById(
      "winDifference"
    );


  differenceElement.textContent =
    (
      data.difference >= 0
        ? "+"
        : ""
    )
    +
    data.difference.toFixed(2);


  differenceElement.style.color =
    data.difference >= 0
      ? "#168c83"
      : "#c44a4a";


  document
    .getElementById("errorRate")
    .textContent =
      data.errorRate.toFixed(2)
      +
      "%";


  document
    .getElementById("hitWithinProbability")
    .textContent =
      (
        data.hitProbability *
        100
      ).toFixed(2)
      +
      "%";


  document
    .getElementById("missWithinProbability")
    .textContent =
      (
        data.missProbability *
        100
      ).toFixed(2)
      +
      "%";

}



/* =====================================
   HISTORY TABLE
===================================== */

function renderHistory(
  history
) {


  const body =
    document.getElementById(
      "historyBody"
    );


  body.innerHTML =
    "";


  history.forEach(
    item => {


      const row =
        document.createElement(
          "tr"
        );


      const actualText =
        item.actualProbability
          ?
          "1 / "
          +
          item.actualProbability.toFixed(2)
          :
          "当選なし";


      row.innerHTML = `

        <td>
          ${item.number}
        </td>

        <td>
          ${formatNumber(item.trials)}
        </td>

        <td>
          ${formatNumber(item.wins)}
        </td>

        <td>
          ${formatNumber(item.maxMiss)}
        </td>

        <td>
          ${actualText}
        </td>

      `;


      body.appendChild(
        row
      );

    }
  );

}



/* =====================================
   CHART
===================================== */

function renderDistributionChart(
  winCounts
) {


  const distribution =
    {};


  winCounts.forEach(
    wins => {


      if (
        distribution[wins]
        === undefined
      ) {

        distribution[wins] =
          0;

      }


      distribution[wins]++;

    }
  );


  const labels =
    Object
      .keys(distribution)
      .map(Number)
      .sort(
        (a, b) =>
          a - b
      );


  const values =
    labels.map(
      label =>
        distribution[label]
    );


  const canvas =
    document.getElementById(
      "distributionChart"
    );


  const ctx =
    canvas.getContext("2d");


  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      400
    );


  gradient.addColorStop(
    0,
    "rgba(22, 140, 131, 0.95)"
  );


  gradient.addColorStop(
    0.55,
    "rgba(47, 158, 150, 0.65)"
  );


  gradient.addColorStop(
    1,
    "rgba(116, 204, 196, 0.20)"
  );


  if (
    distributionChart
  ) {

    distributionChart.destroy();

  }


  distributionChart =
    new Chart(
      ctx,
      {

        type:
          "bar",


        data: {

          labels:
            labels,


          datasets: [

            {

              label:
                "発生セット数",

              data:
                values,

              backgroundColor:
                gradient,

              borderColor:
                "#168c83",

              borderWidth:
                1,

              borderRadius:
                6,

              borderSkipped:
                false,

              barPercentage:
                0.82,

              categoryPercentage:
                0.9

            }

          ]

        },


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,


          animation: {

            duration:
              750,

            easing:
              "easeOutQuart"

          },


          interaction: {

            mode:
              "index",

            intersect:
              false

          },


          plugins: {


            legend: {

              display:
                false

            },


            tooltip: {

              backgroundColor:
                "#182638",

              titleColor:
                "#ffffff",

              bodyColor:
                "#d6dee6",

              borderColor:
                "rgba(255,255,255,.12)",

              borderWidth:
                1,

              padding:
                12,

              cornerRadius:
                8,


              callbacks: {


                title(
                  context
                ) {

                  return (
                    context[0].label
                    +
                    "回当選"
                  );

                },


                label(
                  context
                ) {

                  const count =
                    context.raw;


                  const percent =
                    (
                      count /
                      winCounts.length *
                      100
                    ).toFixed(2);


                  return (
                    count.toLocaleString()
                    +
                    "セット"
                    +
                    "（"
                    +
                    percent
                    +
                    "%）"
                  );

                }

              }

            }

          },


          scales: {


            x: {

              grid: {

                display:
                  false

              },


              border: {

                display:
                  false

              },


              ticks: {

                color:
                  "#7a8794",

                font: {

                  size:
                    11

                }

              },


              title: {

                display:
                  true,

                text:
                  "1セットあたりの当選回数",

                color:
                  "#89939f",

                padding:
                  12

              }

            },


            y: {

              beginAtZero:
                true,


              grid: {

                color:
                  "rgba(24,38,56,.07)",

                drawTicks:
                  false

              },


              border: {

                display:
                  false

              },


              ticks: {

                color:
                  "#7a8794",

                padding:
                  8

              },


              title: {

                display:
                  true,

                text:
                  "発生セット数",

                color:
                  "#89939f"

              }

            }

          }

        }

      }
    );

}
