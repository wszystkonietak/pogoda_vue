<template>
<div :class="weatherClass">
    <section id="searching">
    <input type="text" v-model="location" placeholder="Enter location">
    <button @click="search_place">Search</button>
    </section>
    <a v-if="message!=''">{{message}}</a>

    <div v-if="data.name && !isLoading">
        <section id="top">
        <section id="celcius">
            <h1>{{kelvinToCelsius(data.main.temp)}}°C</h1>
            <img v-if="data.weather && data.weather.length > 0" :src="'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png'" alt="Weather Icon" width="70%">
        </section>
        <img id="flag" :src="'https://flagicons.lipis.dev/flags/4x3/' + data.sys.country.toLowerCase() + '.svg'" alt="flag" width="7%">
        </section>
        <p>{{data.main.temp}}°F</p>
        <p>Wschod slonca {{convertUnixTimestamp(data.sys.sunrise)}}</p>
        <p>Zachod slonca {{convertUnixTimestamp(data.sys.sunset)}}</p>
        <p>Pomiar wykonano {{getTimeAgo(data.dt)}}</p>

        
        <div id="chart">
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
                if (minutesAgo == 1) {
                    return `${minutesAgo} godzine temu`;
                } else if (minutesAgo < 5) {
                    return `${minutesAgo} godziny temu`;
                } else {
                    return `${minutesAgo} godzin temu`;
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
                if (minutesAgo == 1) {
                    return `${minutesAgo} sekunde temu`;
                } else if (minutesAgo < 5) {
                    return `${minutesAgo} sekundy temu`;
                } else {
                    return `${minutesAgo} sekund temu`;
                }
            }
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
                                text: 'Month'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Value'
                            },
                            min:Math.min(Math.floor(Math.min.apply(Math, dataset) / 10) * 10, Math.floor(Math.min.apply(Math, feels_like) / 10) * 10),
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
#searching {
    margin: auto;
    width: 40%;
}
#top {
    display:flex;
}
#celcius {
    display:flex;
}
#flag {
    
    margin-left: 80%;
}
#chart {
    border: 5px solid;
    margin: auto;
    width: 80%;
    padding: 10px;
    background-color: #F6F5F5;
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
