import { AfterViewInit, Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements AfterViewInit {
  ngAfterViewInit() {
    this.renderBarChart();
    this.renderUserBarChart(); // Render the second chart
  }

  renderBarChart() {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'January', 'February', 'March', 'April', 'May',
          'June', 'July', 'August', 'September', 'October',
          'November', 'December',
        ],
        datasets: [
          {
            label: 'Year Usage Stats 2024',
            data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  renderUserBarChart() {
    const ctx = document.getElementById('userBarChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Andrew', 'Lotus', 'Lawrence'],
        datasets: [
          {
            label: 'User Performance',
            data: [10, 12, 15],
            backgroundColor: [
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        indexAxis: 'y',
      },
    });
  }
}
