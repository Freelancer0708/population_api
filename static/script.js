let populationChart;
let worldPopulation = 0;

// 🌍 APIから最新の世界人口を取得
async function fetchWorldPopulation() {
    try {
        const response = await fetch("/api/world_population");
        const data = await response.json();
        if (data.world_population) {
            worldPopulation = data.world_population;
        } else {
            console.error("世界人口の取得に失敗:", data.error);
        }
    } catch (error) {
        console.error("世界人口の取得エラー:", error);
    }
}

// 🌍 国の人口を取得し、円グラフを更新
async function searchPopulation() {
    const country = document.getElementById("countryInput").value.trim();
    if (!country) {
        alert("国名を入力してください");
        return;
    }

    try {
        const response = await fetch(`/api/population?country=${encodeURIComponent(country)}`);
        const data = await response.json();
        if (data.error) {
            document.getElementById("result").innerText = "エラー: " + data.error;
        } else {
            document.getElementById("result").innerText =
                `${data.country} の人口は ${data.population.toLocaleString()} 人です。`;

            updateChart(data.country, data.population);
        }
    } catch (error) {
        console.error("エラー:", error);
    }
}

// 📊 円グラフを更新
function updateChart(countryName, countryPopulation) {
    if (!worldPopulation) {
        console.warn("世界人口データがまだ取得できていません");
        return;
    }

    const otherPopulation = worldPopulation - countryPopulation;
    const countryPercentage = ((countryPopulation / worldPopulation) * 100).toFixed(2);
    const otherPercentage = (100 - countryPercentage).toFixed(2);

    const chartData = {
        labels: [`${countryName} (${countryPercentage}%)`, `その他の世界 (${otherPercentage}%)`],
        datasets: [{
            data: [countryPopulation, otherPopulation],
            backgroundColor: ["#ff6384", "#36a2eb"]
        }]
    };

    if (populationChart) {
        populationChart.data = chartData;
        populationChart.update();
    } else {
        const ctx = document.getElementById("populationChart").getContext("2d");
        populationChart = new Chart(ctx, {
            type: "pie",
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw.toLocaleString()} 人`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// 🌍 ページ読み込み時に世界人口を取得
fetchWorldPopulation();
