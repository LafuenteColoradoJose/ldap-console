import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch dashboard stats', () => {
    const dummyStats = { 
      status: 'success', 
      data: { 
        users: { total: 10, online: 2 },
        groups: { total: 5 },
        computers: { total: 8, online: 1 }
      } 
    };
    service.getStats().subscribe(stats => {
      expect(stats.data.users.total).toBe(10);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/dashboard/stats');
    expect(req.request.method).toBe('GET');
    req.flush(dummyStats);
  });
});
