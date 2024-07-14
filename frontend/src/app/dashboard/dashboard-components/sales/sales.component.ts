import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { Observable } from 'rxjs';
import { InventoryService } from 'src/app/inventory.service';

export interface ChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  fill?: ApexFill;
  title?: ApexTitleSubtitle;
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
})
export class SalesComponent implements OnInit, AfterViewInit {
  public totalInventory = 0;
  public averageInventory = 0;
  public topModel = '';
  public highestInventoryStore = '';
  public lowestInventoryStore = '';
  public highestAverageInventoryModel = '';
  public lowestAverageInventoryModel = '';
  public alerts$: Observable<any[]>;
  public inventory$: Observable<any>;
  public summaries: { title: string, value: string | number }[] = [];

  public areaChartOptions: Partial<ChartOptions> | any;
  public heatmapChartOptions: Partial<ChartOptions> | any;
  public pieChartOptions: Partial<ChartOptions> | any;
  public radarChartOptions: Partial<ChartOptions> | any;

  constructor(private inventoryService: InventoryService, private cdr: ChangeDetectorRef) {
    this.inventory$ = this.inventoryService.inventory$;
    this.alerts$ = this.inventoryService.alerts$;
    this.initializeChartOptions();
  }

  ngOnInit() {
    this.initializeSummaries();
  }

  ngAfterViewInit() {
    this.subscribeToInventoryUpdates();
    this.cdr.detectChanges();
  }

  initializeChartOptions() {
    const chartDefaults = {
      chart: { height: 350 },
      series: [{ name: 'Inventory', data: [] }],
      xaxis: { categories: [] },
      title: { text: 'Inventory by Store' }
    };
    
    this.areaChartOptions = { ...chartDefaults, chart: { ...chartDefaults.chart, type: 'area' }};
    this.heatmapChartOptions = { ...chartDefaults, chart: { ...chartDefaults.chart, type: 'heatmap' }};
    this.pieChartOptions = { ...chartDefaults, chart: { ...chartDefaults.chart, type: 'pie' }, series: [], labels: [] };
    this.radarChartOptions = { ...chartDefaults, chart: { ...chartDefaults.chart, type: 'radar' }};
  }

  initializeSummaries() {
    this.summaries = [
      { title: 'Total Inventory', value: `${this.totalInventory} Units` },
      { title: 'Average Inventory', value: `${this.averageInventory.toFixed(0)} Units` },
      { title: 'Top Model', value: this.topModel },
      { title: 'Store with Highest Inventory', value: this.highestInventoryStore },
      { title: 'Store with Lowest Inventory', value: this.lowestInventoryStore },
      { title: 'Model with Highest Average Inventory', value: this.highestAverageInventoryModel },
      { title: 'Model with Lowest Average Inventory', value: this.lowestAverageInventoryModel }
    ];
  }

  subscribeToInventoryUpdates() {
    this.inventory$.subscribe((data) => {
      this.updateCharts(data);
      this.updateSummary(data);
      this.cdr.detectChanges();
    });
  }

  updateCharts(data: any) {
    if (!data || data.length === 0) {
      console.warn("No data available to update charts.");
      this.initializeChartOptions();
      return;
    }

    const stores = data.map((store: any) => store.name);
    const models = [...new Set(data.flatMap((store: any) => store.shoes.map((shoe: any) => shoe.model)))];
    const storeInventory = models.map(model => ({
      name: model,
      data: data.map((store: any) => store.shoes.find((s: any) => s.model === model)?.inventory || 0)
    }));
    const aggregatedInventory = models.map(model => data.reduce((sum: any, store: any) => sum + (store.shoes.find((s: any) => s.model === model)?.inventory || 0), 0));

    this.areaChartOptions.series = storeInventory;
    this.areaChartOptions.xaxis = { categories: stores };
    this.heatmapChartOptions.series = storeInventory;
    this.heatmapChartOptions.xaxis = { categories: stores };
    this.pieChartOptions.series = aggregatedInventory;
    this.pieChartOptions.labels = models;
    this.radarChartOptions.series = [{ name: 'Inventory', data: aggregatedInventory }];
    this.radarChartOptions.xaxis = { categories: models };

    this.updateApexCharts();
  }

  updateSummary(data: any) {
    if (!data || data.length === 0) {
      console.warn("No data available for summary.");
      this.resetSummary();
      return;
    }

    let totalInventory = 0;
    let modelCount: { [key: string]: number } = {};
    let shoeCount = 0;
    let storeInventory: { [key: string]: number } = {};

    data.forEach((store: any) => {
      let storeTotal = 0;
      store.shoes.forEach((shoe: any) => {
        totalInventory += shoe.inventory;
        storeTotal += shoe.inventory;
        shoeCount++;
        modelCount[shoe.model] = (modelCount[shoe.model] || 0) + shoe.inventory;
      });
      storeInventory[store.name] = storeTotal;
    });

    this.totalInventory = totalInventory;
    this.averageInventory = totalInventory / shoeCount;
    this.topModel = this.getTopModel(modelCount);

    this.highestInventoryStore = this.getStoreWithHighestInventory(storeInventory);
    this.lowestInventoryStore = this.getStoreWithLowestInventory(storeInventory);
    this.highestAverageInventoryModel = this.getModelWithHighestAverageInventory(modelCount, data.length);
    this.lowestAverageInventoryModel = this.getModelWithLowestAverageInventory(modelCount, data.length);

    this.initializeSummaries(); 
  }

  resetSummary() {
    this.totalInventory = 0;
    this.averageInventory = 0;
    this.topModel = '';

    this.highestInventoryStore = '';
    this.lowestInventoryStore = '';
    this.highestAverageInventoryModel = '';
    this.lowestAverageInventoryModel = '';
    this.initializeSummaries();
  }

  getTopModel(modelCount: { [key: string]: number }) {
    return Object.keys(modelCount).reduce((a, b) => modelCount[a] > modelCount[b] ? a : b, '');
  }

  getStoreWithHighestInventory(storeInventory: { [key: string]: number }) {
    return Object.keys(storeInventory).reduce((a, b) => storeInventory[a] > storeInventory[b] ? a : b, '');
  }

  getStoreWithLowestInventory(storeInventory: { [key: string]: number }) {
    return Object.keys(storeInventory).reduce((a, b) => storeInventory[a] < storeInventory[b] ? a : b, '');
  }

  getModelWithHighestAverageInventory(modelCount: { [key: string]: number }, storeCount: number) {
    return Object.keys(modelCount).reduce((a, b) => (modelCount[a] / storeCount) > (modelCount[b] / storeCount) ? a : b, '');
  }

  getModelWithLowestAverageInventory(modelCount: { [key: string]: number }, storeCount: number) {
    return Object.keys(modelCount).reduce((a, b) => (modelCount[a] / storeCount) < (modelCount[b] / storeCount) ? a : b, '');
  }

  updateApexCharts() {
    ApexCharts.exec('areaChart', 'updateOptions', this.areaChartOptions, false, true);
    ApexCharts.exec('heatmapChart', 'updateOptions', this.heatmapChartOptions, false, true);
    ApexCharts.exec('pieChart', 'updateOptions', this.pieChartOptions, false, true);
    ApexCharts.exec('radarChart', 'updateOptions', this.radarChartOptions, false, true);
  }
}
