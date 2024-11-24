import { AfterViewInit, Component } from "@angular/core";
import { Chart, registerables } from "chart.js";
import { catchError } from "rxjs/operators"; // For error handling
import { AdServiceUsersService } from "../../../services/admin/ad-service-users/ad-service-users.service";
import { ActivatedRoute } from "@angular/router";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
Chart.register(...registerables);

@Component({
  selector: "app-ad-user-usage-stats",
  templateUrl: "./ad-user-usage-stats.component.html",
  styleUrls: ["./ad-user-usage-stats.component.css"],
})
export class AdUserUsageStatsComponent implements AfterViewInit {
  startDate: string = "";
  endDate: string = "";
  formattedStartDate: string = "";
  formattedEndDate: string = "";
  userStatsData: any = []; // Store data for user chart
  usageStatsData: any = []; // Store data for usage stats chart
  userId: string = "";
  orgId: string = "";
  private chartInstance: Chart | null = null; // Store reference to the chart instance
  private chartInstance2: Chart | null = null;

  totalRequestsCurrentYear: number = 0;
  totalRequestsLastYear: number = 0;
  totalRequestsCurrentMonth: number = 0;
  totalRequestsLastMonth: number = 0;

  currentYear: number;
  lastYear: number;

  currentMonthName: string = '';
  lastMonthName: string = '';

  constructor(
    private apiService: AdServiceUsersService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService
  ) {

    const today = new Date();
    this.currentYear = today.getFullYear();
    this.lastYear = today.getFullYear() - 1;
    this.currentMonthName = this.getMonthName(today.getMonth()); // Current month
    this.lastMonthName = this.getMonthName(today.getMonth() - 1); // Last month

    this.route.params.subscribe((params) => {
      const newUserId = params["id"];
      const orgid = params["orgid"];
      this.orgId = orgid;
      if (newUserId && newUserId !== this.userId) {
        this.userId = newUserId;
      }
    });
  }
  getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex < 0 ? 11 : monthIndex]; // Handle negative index for last month
  }
  ngOnInit() {
    this.startDate = moment().startOf("month").format("YYYY-MM-DD");
    this.endDate = moment().endOf("month").format("YYYY-MM-DD");
    this.onFetchData();
    this.fetchStats();
    this.formattedStartDate = moment().startOf("month").format("ll");
    this.formattedEndDate = moment().endOf("month").format("ll");
  }

  fetchStats() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get current month (0 to 11)

    // Construct start and end date for current year and last year
    const startDateCurrentYear = `${this.currentYear}-01-01`;
    const endDateCurrentYear = `${this.currentYear}-12-31`;

    const startDateLastYear = `${this.lastYear}-01-01`;
    const endDateLastYear = `${this.lastYear}-12-31`;

    // Fetch the total requests for the entire year, last year, current month, and last month
    this.getRequests(startDateCurrentYear, endDateCurrentYear, (totalRequests) => {
      this.totalRequestsCurrentYear = totalRequests;
    });

    this.getRequests(startDateLastYear, endDateLastYear, (totalRequests) => {
      this.totalRequestsLastYear = totalRequests;
    });

    // Fetch the current and last month requests
    const startDateCurrentMonth = `${this.currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const endDateCurrentMonth = `${this.currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${this.getDaysInMonth(currentMonth + 1)}`;

    const startDateLastMonth = `${this.currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDateLastMonth = `${this.currentYear}-${String(currentMonth).padStart(2, '0')}-${this.getDaysInMonth(currentMonth)}`;

    this.getRequests(startDateCurrentMonth, endDateCurrentMonth, (totalRequests) => {
      this.totalRequestsCurrentMonth = totalRequests;
    });

    this.getRequests(startDateLastMonth, endDateLastMonth, (totalRequests) => {
      this.totalRequestsLastMonth = totalRequests;
    });
  }

  // Helper function to fetch request counts
  getRequests(startDate: string, endDate: string, callback: (result: number) => void) {
    
    this.spinner.show();
    this.apiService
      .getUserMessageStats(this.userId, startDate, endDate)
      .pipe(
        catchError((error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          alert('Error fetching user stats: '+ error);
          return []; // Return empty data in case of error
        })
      )
      .subscribe((data: any) => {
        const months = data.result?.months || [];
        const totalRequests = this.calculateTotalRequests(months);
        callback(totalRequests);
        setTimeout(() => {
          this.spinner.hide();
        }, 100);
      });
  }

  // Helper function to sum up requests for the months data
  calculateTotalRequests(months: any[]): number {
    return months.reduce((total, month) => total + Object.values(month)[0], 0);
  }

  // Get the number of days in a month
  getDaysInMonth(month: number): number {
    const date = new Date(this.currentYear, month, 0);
    return date.getDate();
  }


  ngAfterViewInit() {
    this.renderBarChart(); // Initial render with default data
  }

  // Trigger API calls when the button is clicked
  onFetchData() {
    if (this.startDate && this.endDate) {
      this.getUserMessageStats();
      this.getOrganizationMessageStats();
    }
  }

  // Call the endpoint for User Stats based on the selected date
  getUserMessageStats() {
    this.spinner.show();
    this.apiService
      .getUserMessageStats(this.userId, this.startDate, this.endDate)
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

  // Call the endpoint for Organization Stats based on the selected date
  getOrganizationMessageStats() {
    this.spinner.show();
    this.apiService
      .getOrganizationMessageStats(this.orgId, this.startDate, this.endDate)
      .pipe(
        catchError((error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          alert("Error fetching organization stats: " + error);
          return []; // Return empty data in case of error
        })
      )
      .subscribe((data: any) => {
        this.usageStatsData = data.result.stats;
        console.log(this.usageStatsData);
        this.renderBarChartForOrg();
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

  renderBarChartForOrg() {
    const ctx = document.getElementById("orgBarChart") as HTMLCanvasElement;
  
    // Destroy the chart instance if it exists
    if (this.chartInstance2) {
      this.chartInstance2.destroy();
    }
  
    // Extract labels and values from the organization stats
    const labels: string[] = Object.keys(this.usageStatsData); // Explicitly typed as string[]
    const values: number[] = Object.values(this.usageStatsData).map((value) => Number(value)); // Explicitly convert to number[]
  
    console.log("Org Labels:", labels);
    console.log("Org Values:", values);
  
    // Create a new chart instance
    this.chartInstance2 = new Chart(ctx, {
      type: "bar",
      data: {
        labels, // Use extracted names as labels
        datasets: [
          {
            label: `Organization Message Stats (${this.formattedStartDate} - ${this.formattedEndDate})`,
            data: values, // Use extracted values as data
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
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
