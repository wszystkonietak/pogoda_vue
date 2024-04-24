<template>
<div :class="weatherClass">
    <section id="searching">
        <input type="text" v-model="location" placeholder="Enter location">
        <button @click="search_place">Search</button>
    </section>
    <a v-if="message!=''">{{message}}</a>

    <div>{{prediction_data}}</div>
    <div id="city" v-if="data.name && !isLoading">
        <h1>{{data.name}}</h1>
        <p>Pomiar wykonano {{getTimeAgo(data.dt)}}</p>
        <section id="data">
            <section id="left">
                <section id="degrees">
                    <img v-if="data.weather && data.weather.length > 0" :src="'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png'" alt="Weather Icon" width="100px" height="100px">
                    <h4>{{kelvinToCelsius(data.main.temp)}}<sup>°C | {{data.main.temp}}°F</sup></h4>
                </section>
                <section id="info">
                    <p>wiatr: {{data.wind.speed}} km/h</p>
                    <p>wilgotnosc: {{data.main.humidity}}%</p>
                    <p>cisnienie: {{data.main.pressure}}</p>
                </section>
            </section>
            <section id="right">

                <section id="weather">
                    <h4>Pogoda</h4>
                    <img id="flag" :src="'https://flagicons.lipis.dev/flags/4x3/' + data.sys.country.toLowerCase() + '.svg'" alt="flag" width="7%">
                </section>
                <h5>{{data.weather[0].main}}</h5>
                <p>Wschod slonca {{convertUnixTimestamp(data.sys.sunrise)}}</p>
                <p>Zachod slonca {{convertUnixTimestamp(data.sys.sunset)}}</p>
            </section>
        </section>

        <div id="chart">
            <section id="chart_options">
                <button @click="chart_temperature">temperature</button>
                <button @click="chart_pressure">cisnienie</button>
                <button @click="chart_humidity">wilgotnosc</button>
            </section>
            <Line ref="chart" id="my-chart-id" :options="chartOptions" :data="prediction_temperature" />

        </div>
    </div>
    <div v-if="isLoading" class="loader"></div>
</div>
</template>

<script>
import Sample from '@/components/text.vue'
import {
    Line
} from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

function convertUnixTimestampFull(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {
        hour12: false
    };
    return date.getDate() + "." + date.getMonth() + " " + date.getHours() + ":" + date.getMinutes();
}

function kelvinToCelsius(temp) {
    return (temp - 273.15).toFixed(2);
}

function convertUnixTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {
        hour12: false
    };
    return date.toLocaleTimeString('en-US', options);
}
export default {
    components: {
        Line
    },
    data() {
        return {
            location: "Miedzyzdroje",
            message: "",
            isLoading: false,
            chartOptions: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Line Chart Example'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Value'
                        },
                        min: 0,
                        max: 30
                    }
                }
            },
            prediction_temperature: {
                labels: [],
                datasets: [{
                    data: [],
                    label: ''
                }]
            },
            data: {},
            prediction_data: {}
        }
    },
    methods: {
        kelvinToCelsius(temp) {
            return (temp - 273.15).toFixed(2);
        },
        getHour(timestamp) {
            const date = new Date(timestamp * 1000);
            const options = {
                hour12: false
            };
            return date.getHours();
        },
        getDayName(timestamp) {
            const date = new Date(timestamp * 1000);
            const options = {
                hour12: false
            };
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
            return days[date.getDay()];
        },
        convertUnixTimestamp(timestamp) {
            const date = new Date(timestamp * 1000);
            const options = {
                hour12: false
            };
            return date.toLocaleTimeString('en-US', options);
        },
        convertUnixTimestampFull(timestamp) {
            const date = new Date(timestamp * 1000);
            const options = {
                hour12: false
            };
            return date.getDate() + "." + date.getMonth();
        },
        getTimeAgo(dt) {
            const now = Math.floor(Date.now() / 1000);
            const secondsAgo = now - dt;

            const minutesAgo = Math.floor(secondsAgo / 60);
            const hoursAgo = Math.floor(minutesAgo / 60);
            const daysAgo = Math.floor(hoursAgo / 24);

            if (daysAgo > 0) {
                return `${daysAgo} dnie temu`;
            } else if (hoursAgo > 0) {
                if (hoursAgo == 1) {
                    return `${hoursAgo} godzine temu`;
                } else if (hoursAgo < 5) {
                    return `${hoursAgo} godziny temu`;
                } else {
                    return `${hoursAgo} godzin temu`;
                }
            } else if (minutesAgo > 0) {
                if (minutesAgo == 1) {
                    return `${minutesAgo} minute temu`;
                } else if (minutesAgo < 5) {
                    return `${minutesAgo} minuty temu`;
                } else {
                    return `${minutesAgo} minut temu`;
                }
            } else {
                if (secondsAgo == 1) {
                    return `${secondsAgo} sekunde temu`;
                } else if (secondsAgo < 5 && secondsAgo != 0) {
                    return `${secondsAgo} sekundy temu`;
                } else {
                    return `${secondsAgo} sekund temu`;
                }
            }
        },
        update_chart(lables, datas, min, max, text) {
            this.prediction_temperature = {
                labels: lables,
                datasets: datas
            };
            this.chartOptions = {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Wykresy'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: text
                        },
                        min: min,
                        max: max
                    }
                },
                interaction: {
                    intersect: false,
                },
            }
        },
        chart_temperature() {
            let dataset = [];
            let feels_like = [];
            let lables = [];
            this.prediction_data.list.forEach((element) => {
                lables.push(convertUnixTimestampFull(element.dt));
                dataset.push(kelvinToCelsius(element.main.temp));
                feels_like.push(kelvinToCelsius(element.main.feels_like));
            });
            let datas = [];
            datas.push({
                data: dataset,
                tension: 0.3,
                pointRadius: 0,
                borderColor: "#0C359E",
                label: "Temperatura"
            });
            datas.push({
                data: feels_like,
                tension: 0.3,
                pointRadius: 0,
                borderColor: "#EE99C2",
                label: "Odczuwalna temperatura"
            });
            let min = Math.min(Math.floor(Math.min.apply(Math, dataset) / 10) * 10, Math.floor(Math.min.apply(Math, feels_like) / 10) * 10);
            let max = Math.max(Math.ceil(Math.max.apply(Math, dataset) / 10) * 10, Math.ceil(Math.max.apply(Math, feels_like) / 10) * 10);
            let text = 'Temperatura (°C)';
            this.update_chart(lables, datas, min, max, text);
        },
        chart_humidity() {
            let dataset = [];
            let lables = [];
            this.prediction_data.list.forEach((element) => {
                lables.push(this.convertUnixTimestampFull(element.dt));
                dataset.push(element.main.humidity);
            });
            let datas = [];
            datas.push({
                data: dataset,
                tension: 0.3,
                pointRadius: 0,
                borderColor: "#0C359E",
                label: "Wilgotnosc"
            });
            let min = Math.floor(Math.min.apply(Math, dataset) / 10) * 10;
            let max = Math.ceil(Math.max.apply(Math, dataset) / 10) * 10;
            let text = "Wilgotnosc(%)";
            this.update_chart(lables, datas, min, max, text);
        },
        chart_pressure() {
            let dataset = [];
            let lables = [];
            this.prediction_data.list.forEach((element) => {
                lables.push(convertUnixTimestampFull(parseInt(element.dt)));
                dataset.push(element.main.pressure);
            });
            let datas = [];
            datas.push({
                data: dataset,
                tension: 0.3,
                pointRadius: 0,
                borderColor: "#0C359E",
                label: "Cisnienie"
            });
            let min = Math.floor(Math.min.apply(Math, dataset) / 10) * 10;
            let max = Math.ceil(Math.max.apply(Math, dataset) / 10) * 10;
            let text = "Cisnienie(Pa)"
            this.update_chart(lables, datas, min, max, text);
        },
        async search_place() {
            this.isLoading = true;
            let url = "https://api.openweathermap.org/data/2.5/weather?lat=";

            try {
                const response = await fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + this.location + '&appid=bd5e378503939ddaee76f12ad7a97608');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                this.data = result;
            } catch (error) {
                console.error('There was a problem with your fetch operation: ', error);
            }
            if (!this.data[0]) {
                this.message = "this place does not exist!";
                this.isLoading = false;
                return;
            } else {
                this.message = "";
            }
            url += this.data[0].lat + "&lon=" + this.data[0].lon + "&appid=bd5e378503939ddaee76f12ad7a97608";
            let prediction_data_url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + this.data[0].lat + "&lon=" + this.data[0].lon + "&appid=bd5e378503939ddaee76f12ad7a97608";
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                this.data = result;
            } catch (error) {
                console.error('There was a problem with your fetch operation: ', error);
            }
            try {
                const response = await fetch(prediction_data_url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                this.prediction_data = result;
                let dataset = [];
                let feels_like = [];
                let lables = [];
                this.prediction_data.list.forEach(function (element) {
                    lables.push(convertUnixTimestampFull(element.dt));
                    dataset.push(kelvinToCelsius(element.main.temp));
                    feels_like.push(kelvinToCelsius(element.main.feels_like));
                });
                // let datas = [...this.prediction_temperature.datasets];
                let datas = [];
                datas.push({
                    data: dataset,
                    tension: 0.3,
                    pointRadius: 0,
                    borderColor: "#0C359E",
                    label: "Temperatura"
                });
                datas.push({
                    data: feels_like,
                    tension: 0.3,
                    pointRadius: 0,
                    borderColor: "#EE99C2",
                    label: "Odczuwalna temperatura"
                });
                this.prediction_temperature = {
                    labels: lables,
                    datasets: datas
                };
                this.chartOptions = {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Wykresy'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Data'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Temperatura(°C)'
                            },
                            min: Math.min(Math.floor(Math.min.apply(Math, dataset) / 10) * 10, Math.floor(Math.min.apply(Math, feels_like) / 10) * 10),
                            max: Math.max(Math.ceil(Math.max.apply(Math, dataset) / 10) * 10, Math.ceil(Math.max.apply(Math, feels_like) / 10) * 10)
                        }
                    },
                    interaction: {
                        intersect: false,
                    },
                }
            } catch (error) {
                console.error('There was a problem with your fetch operation: ', error);
            }
            this.isLoading = false;
        },
    },
    computed: {
        weatherClass() {
            if (this.data.weather && this.data.weather.length > 0) {
                const weather = this.data.weather[0].main.toLowerCase();
                switch (weather) {
                    case 'clear':
                        return 'clear-sky';
                    case 'clouds':
                        return 'cloudy';
                    case 'rain':
                    case 'drizzle':
                        return 'rainy';
                    case 'thunderstorm':
                        return 'thunderstorm';
                    case 'snow':
                        return 'snowy';
                    default:
                        return 'default-bg';
                }
            }
            return 'default-bg';
        }
    }
};
</script>

<style scoped>
#data {
    display: flex;
    margin: auto;
}

#weather {
    display: flex;
    flex-direction: row-reverse;
    gap: 10px;
}

#degrees {
    display: flex;
}

#info {
    padding-top: 10px;
    padding-left: 10px;
    line-height: 2%;
    font-size: 15px;
}

#city {
    padding: 2%;
}

#left {
    width: 50%;
    display: flex;
}

#right {
    line-height: 5%;
    width: 50%;
    text-align: right;
}

#searching {
    margin: auto;
    width: 30%;
    padding-top: 2%;
}

#top {
    display: flex;
}

#chart {
    border: 5px solid;
    margin-left: 10%;
    margin-top: 2%;
    width: 80%;
    background-color: #F6F5F5;
    padding: 1%;
}

sup {
    vertical-align: super;
    font-size: smaller;
    font-weight: 50;
}

.clear-sky {
    background-color: #B5C18E;
}

.cloudy {
    background-color: #A9A9A9;
}

.rainy {
    background-color: #DEAC80;
}

#following_days {
    padding:5%;
    display: flex;
    justify-content: space-between;
}

.day {
    display: flex;
    flex-direction: column;
    border-radius: 10px; 
    background-color: #ccc;
    text-align: center;
    padding: 5px;
    transition: background-color 0.3s ease; 
}

.day:hover {
    background-color: #999;
}

.thunderstorm {
    background-color: #2E5068;
}

.snowy {
    background-color: #F0FFFF;
}

.default-bg {
    background-color: #ffffff;
}

input[type="text"] {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 200px;
    margin-right: 10px;
}

#chart_options {
    padding: 1%;
    display: flex;
    gap: 10px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #EE99C2;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #0C359E;
}

.loader {
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
