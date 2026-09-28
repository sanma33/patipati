let distributionChart = null;


/* ===================================
   DOM
=================================== */

const probabilityInput =
  document.getElementById("probability");

const trialsInput =
  document.getElementById("trials");

const simulationsInput =
  document.getElementById("simulations");

const runButton =
  document.getElementById("runButton");

const preview =
  document.getElementById("operationPreview");



/* ===================================
   FORMAT
=================================== */

function formatNumber(value) {

  return Number(value)
    .toLocaleString("ja-JP");

}



/* ===================================
   PRESET
=================================== */

document
  .querySelectorAll(".preset")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".preset")
          .forEach(item => {

            item.classList.remove(
              "active"
            );

          });


        button.classList.add(
          "active"
        );


        probabilityInput.value =
          button.dataset.value;


        updatePreview();

      }
    );

  });



/* ===================================
   PREVIEW
=================================== */

function updatePreview() {

  const trials =
    Number(trialsInput.value) || 0;

  const simulations =
    Number(simulationsInput.value) || 0;


  preview.textContent =
    formatNumber(
      trials * simulations
    );

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



/* ===================================
   RUN
=================================== */

runButton.addEventListener(
  "click",
  runSimulation
);



function runSimulation() {


  const denominator =
    parseFloat(
      probabilityInput.value
    );


  const trials =
    parseInt(
      trialsInput.value
    );


  const simulations =
    parseInt(
      simulationsInput.value
    );


  if (
    denominator <= 0 ||
    trials <= 0 ||
    simulations <= 0 ||
    Number.isNaN(denominator) ||
    Number.isNaN(trials) ||
    Number.isNaN(simulations)
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
        "試行回数が多いため、処理に時間がかかる可能性があります。\n実行しますか？"
      );


    if (!result) {
      return;
    }

  }



  /* BUTTON STATE */

  runButton.disabled =
    true;


  runButton.innerHTML =
    "計算しています…";



  setTimeout(
    () => {


      calculateSimulation(
        denominator,
        trials,
        simulations
      );


      runButton.disabled =
        false;


      runButton.innerHTML =
        "<span>▶</span> シミュレーション開始";


      document
        .getElementById("result")
        .scrollIntoView({
          behavior:
            "smooth"
        });


    },
    30
  );

}



/* ===================================
   CALCULATION
=================================== */

function calculateSimulation(
  denominator,
  trials,
  simulations
) {


  const probability =
    1 / denominator;


  let totalWins =
    0;


  let maxOverallMiss =
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
      maxOverallMiss
    ) {

      maxOverallMiss =
        maxMiss;

    }



    if (
      history.length <
      20
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

        probability:
          wins > 0
            ? trials / wins
            : null

      });


    }


  }



  /* ===================================
     RESULTS
  =================================== */


  const totalTrials =
    trials * simulations;


  const expectedWins =
    totalTrials /
    denominator;


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
    Math.abs(
      difference
    )
    /
    expectedWins
    *
    100;



  const missProbability =
    Math.pow(
      1 - probability,
      trials
    );


  const hitProbability =
    1 - missProbability;



  /* ===================================
     DISPLAY
  =================================== */


  document
    .getElementById("totalTrials")
    .textContent =
      formatNumber(totalTrials);


  document
    .getElementById("totalWins")
    .textContent =
      formatNumber(totalWins);


  document
    .getElementById("actualProbability")
    .textContent =
      actualProbability
        ? "1 / " +
          actualProbability.toFixed(2)
        : "当選なし";


  document
    .getElementById("maxMiss")
    .textContent =
      formatNumber(maxOverallMiss);


  document
    .getElementById("expectedWins")
    .textContent =
      expectedWins.toFixed(2);


  document
    .getElementById("averageWins")
    .textContent =
      averageWins.toFixed(2);


  document
    .getElementById("winDifference")
    .textContent =
      (
        difference >= 0
          ? "+"
          : ""
      )
      +
      difference.toFixed(2);


  document
    .getElementById("errorRate")
    .textContent =
      errorRate.toFixed(2)
      +
      "%";


  document
    .getElementById("hitWithinProbability")
    .textContent =
      (
        hitProbability *
        100
      ).toFixed(2)
      +
      "%";


  document
    .getElementById("missWithinProbability")
    .textContent =
      (
        missProbability *
        100
      ).toFixed(2)
      +
      "%";


  document
    .getElementById("chartAverage")
    .textContent =
      averageWins.toFixed(2)
      +
      "回";


  renderHistory(
    history
  );


  renderChart(
    winCounts,
    averageWins
  );

}



/* ===================================
   HISTORY
=================================== */

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
          ${
            item.probability
              ? "1 / " +
                item.probability.toFixed(2)
              : "当選なし"
          }
        </td>

      `;


      body.appendChild(
        row
      );


    }
  );

}



/* ===================================
   CHART
=================================== */

function renderChart(
  winCounts,
  averageWins
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
        (a,b) =>
          a - b
      );


  const values =
    labels.map(
      key =>
        distribution[key]
    );



  const canvas =
    document.getElementById(
      "distributionChart"
    );


  const ctx =
    canvas.getContext(
      "2d"
    );



  /* GRADIENT */

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      380
    );


  gradient.addColorStop(
    0,
    "rgba(125, 109, 255, 0.95)"
  );


  gradient.addColorStop(
    0.55,
    "rgba(80, 134, 255, 0.72)"
  );


  gradient.addColorStop(
    1,
    "rgba(47, 210, 255, 0.20)"
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
                "rgba(150,140,255,.95)",

              borderWidth:
                1,

              borderRadius:
                7,

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


          interaction: {

            intersect:
              false,

            mode:
              "index"

          },


          animation: {

            duration:
              750,

            easing:
              "easeOutQuart"

          },


          plugins: {


            legend: {

              display:
                false

            },


            tooltip: {


              backgroundColor:
                "#141c2e",

              titleColor:
                "#ffffff",

              bodyColor:
                "#c9d1e2",

              borderColor:
                "rgba(255,255,255,.12)",

              borderWidth:
                1,

              cornerRadius:
                10,

              padding:
                12,


              callbacks: {


                title:
                  context =>

                    context[0].label
                    +
                    "回当選",


                label:
                  context => {

                    const count =
                      context.raw;


                    const percent =
                      (
                        count /
                        winCounts.length *
                        100
                      ).toFixed(2);


                    return (
                      count
                      +
                      "セット（"
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
                  "#768199",

                font: {

                  size:
                    11

                }

              },


              title: {

                display:
                  true,

                text:
                  "1セットの当選回数",

                color:
                  "#69748a",

                padding:
                  12

              }


            },



            y: {


              beginAtZero:
                true,


              grid: {

                color:
                  "rgba(255,255,255,.05)"

              },


              border: {

                display:
                  false

              },


              ticks: {

                color:
                  "#768199"

              },


              title: {

                display:
                  true,

                text:
                  "発生セット数",

                color:
                  "#69748a"

              }


            }


          }


        }


      }
    );

}