import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComputerService } from './computer.service';

describe('ComputerService', () => {
  let service: ComputerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ComputerService]
    });
    service = TestBed.inject(ComputerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all computers', () => {
    const dummyComputers = [{ cn: 'PC1' }];
    service.getAllComputers().subscribe(computers => {
      expect(computers.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/computers');
    expect(req.request.method).toBe('GET');
    req.flush(dummyComputers);
  });
});
