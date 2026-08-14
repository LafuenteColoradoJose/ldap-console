import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DomainService } from './domain.service';

describe('DomainService', () => {
  let service: DomainService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DomainService]
    });
    service = TestBed.inject(DomainService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch domain info', () => {
    const dummyInfo = { status: 'success', data: { name: 'corp.local' } };
    service.getDomainInfo().subscribe(info => {
      expect(info.name).toBe('corp.local');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/domain/info');
    expect(req.request.method).toBe('GET');
    req.flush(dummyInfo);
  });
});
