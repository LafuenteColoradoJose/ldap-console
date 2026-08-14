import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { DashboardService } from '../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, expect } from 'vitest';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let dashboardServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    dashboardServiceMock = {
      getStats: vi.fn().mockReturnValue(of({
        status: 'success',
        data: {
          users: { total: 10, online: 2 },
          groups: { total: 5 },
          computers: { total: 8, online: 1 }
        }
      }))
    };

    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch stats on init successfully', () => {
    component.fetchStats();
    expect(dashboardServiceMock.getStats).toHaveBeenCalled();
    expect(component.stats()?.users.total).toBe(10);
    expect(component.loading()).toBe(false);
  });

  it('should handle error when fetching stats', () => {
    dashboardServiceMock.getStats.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.fetchStats();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
    
    consoleSpy.mockRestore();
  });

  it('should calculate percentage correctly', () => {
    expect(component.getPercentage(2, 10)).toBe(20);
    expect(component.getPercentage(1, 8)).toBe(13); // 12.5 rounded
    expect(component.getPercentage(0, 5)).toBe(0);
    expect(component.getPercentage(undefined, 5)).toBe(0);
    expect(component.getPercentage(2, 0)).toBe(0);
    expect(component.getPercentage(2, undefined)).toBe(0);
  });

  it('should navigate to path', () => {
    component.navigate('/users');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/users']);
  });
});
