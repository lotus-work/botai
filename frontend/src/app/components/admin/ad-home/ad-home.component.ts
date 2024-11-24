import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdServiceSettingsService } from '../../../services/admin/ad-service-settings/ad-service-settings.service';
import { AdServiceUsersService } from '../../../services/admin/ad-service-users/ad-service-users.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError } from 'rxjs';
import moment from "moment";
Chart.register(...registerables);

@Component({
  selector: 'app-ad-home',
  templateUrl: './ad-home.component.html',
  styleUrl: './ad-home.component.css'
})
export class AdHomeComponent implements AfterViewInit, OnInit {
  totalOrganizations: number = 0;
  totalOwners: number = 0;
  totalNonOwners: number = 0;
  currentGptModel: string = 'not set';
  startDate: string = "";
  endDate: string = "";
  formattedStartDate: string = "";
  formattedEndDate: string = "";
  userStatsData: any = []; 
  private chartInstance: Chart | null = null;

  constructor(private apiSettingsService: AdServiceSettingsService, private apiUserService: AdServiceUsersService, 
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.startDate = moment().startOf("month").format("YYYY-MM-DD");
    this.endDate = moment().endOf("month").format("YYYY-MM-DD");
    this.onFetchData();
    this.formattedStartDate = moment().startOf("month").format("ll");
    this.formattedEndDate = moment().endOf("month").format("ll");
    this.getDashboardStatistics(); 
  }
  
  onFetchData() {
    if (this.startDate && this.endDate) {
      this.getUserMessageStats();
    }
  }
  getDashboardStatistics(): void {
    this.apiSettingsService.getbasicDashboardStatistics().subscribe(
      (response) => {
        // Update component properties with fetched data
        this.totalOrganizations = response.result.details.totalOrganizations;
        this.totalOwners = response.result.details.totalOwners;
        this.totalNonOwners = response.result.details.totalNonOwners;
        this.currentGptModel = response.result.details.currentGptModel;
      },
      (error) => {
        console.error('Error fetching statistics:', error);
      }
    );
  }

  ngAfterViewInit() {
    this.renderBarChart(); // Initial render with default data
  }

  getUserMessageStats() {
    this.spinner.show();
    this.apiUserService
      .getAllUserStats(this.startDate, this.endDate)
      .pipe(
        catchError((error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          alert("Error fetching user stats: " + error);
          return []; // Return empty data in case of error
        })
      )
      .subscribe((data: any) => {
        this.userStatsData = data.result;
        console.log(this.userStatsData);
        this.renderBarChart();
        setTimeout(() => {
          this.spinner.hide();
        }, 100);
      });
  }

  renderBarChart() {
    const ctx = document.getElementById("barChart") as HTMLCanvasElement;

    // Check if the chart already exists and destroy it
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Extract the months data from the response
    const months = this.userStatsData?.months || [];

    // Map through the months data to extract labels and values
    const monthLabels = months.map((monthData: any) => {
      // Extract month names like 'january', 'february' and convert to title case
      const month = Object.keys(monthData)[0];
      return month.charAt(0).toUpperCase() + month.slice(1); // Capitalize first letter
    });

    const monthData = months.map((monthData: any) => {
      return Object.values(monthData)[0]; // Extract the usage values (0, 2, etc.)
    });

    console.log("Month Labels:", monthLabels);
    console.log("Month Data:", monthData);

    // Create a new chart instance
    this.chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: monthLabels, // Use the month names as labels
        datasets: [
          {
            label: `Usage Stats for ${moment()
              .startOf("month")
              .format("LL")} - ${moment().endOf("month").format("LL")}`,
            data: monthData, // Use the extracted usage data
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true, // Ensure the y-axis starts at 0
          },
        },
      },
    });
  }
}