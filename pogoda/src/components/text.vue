<template>
<Line id="my-chart-id" :options="chartOptions" :data="chartData" />
</template>

<script>
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

export default {
    name: 'LineChart',
    components: {
        Line
    },
    props: {
        chartData: {
            labels: ['January', 'February', 'March'],
            datasets: [{
                data: [40, 20, 12],
                label: 'My Dataset'
            }]
        }
    },
    data() {
        return {
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
            }
        }
    },
   
}
</script>
