import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import consumer from './cable';
import { environment } from '../environments/environment';

interface Shoe {
  model: string;
  inventory: number;
}

interface Store {
  name: string;
  shoes: Shoe[];
}

interface Alert {
  message: string;
  severity: string;
}

interface InventoryData {
  inventory: Store[];
  alerts: Alert[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventorySubject = new BehaviorSubject<Store[]>([]);
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  inventory$ = this.inventorySubject.asObservable();
  alerts$ = this.alertsSubject.asObservable();
  private actionCableConnected = false;
  private fallbackTimeout: any;

  constructor(private http: HttpClient) {
    this.subscribeToInventoryChannel();
  }

  private subscribeToInventoryChannel() {
    const subscription = consumer.subscriptions.create('InventoryChannel', {
      connected: () => {
        this.actionCableConnected = true;
        this.notifyBackendOfConnection();
        if (this.fallbackTimeout) {
          clearTimeout(this.fallbackTimeout);
          this.fallbackTimeout = null;
        }
      },
      disconnected: () => {
        this.actionCableConnected = false;
        this.fetchInventoryFallback();
      },
      received: (data: InventoryData) => {
        if (data.error) {
          this.fetchInventoryFallback();
        } else {
          this.inventorySubject.next(data.inventory);
          this.alertsSubject.next(this.transformAlerts(data.alerts));
        }
      }
    });

    this.fallbackTimeout = setTimeout(() => {
      if (!this.actionCableConnected) {
        this.fetchInventoryFallback();
      }
    }, 10000);
  }

  private transformAlerts(alerts: Alert[]): Alert[] {
    return alerts.map(alert => {
      let color = '';
      let icon = '';
      let iconColor = '';

      switch (alert.severity) {
        case 'high':
          color = 'alert-danger';
          icon = 'alert-circle';
          iconColor = 'text-danger';
          break;
        case 'medium':
          color = 'alert-warning';
          icon = 'alert-triangle';
          iconColor = 'text-warning';
          break;
        default:
          color = 'alert-info';
          icon = 'info';
          iconColor = 'text-info';
          break;
      }

      return { ...alert, color, icon, iconColor };
    });
  }

  private notifyBackendOfConnection() {
    this.http.post(`${environment.backendUrl}/api/trigger_websocket_connection`, {})
      .pipe(
        catchError(error => {
          console.error('Error notifying backend of connection', error);
          return of(null);
        })
      )
      .subscribe();
  }

  private fetchInventoryFallback() {
    this.http.get<InventoryData>(`${environment.backendUrl}/api/inventory`)
      .pipe(
        catchError(error => {
          console.error('Error fetching inventory data', error);
          return of({ inventory: [], alerts: [] });
        })
      )
      .subscribe(data => {
        this.inventorySubject.next(data.inventory);
        this.alertsSubject.next(data.alerts);
      });
  }
}
