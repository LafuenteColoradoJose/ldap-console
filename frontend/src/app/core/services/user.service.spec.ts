import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all users', () => {
    const dummyUsers = { status: 'success', data: [{ cn: 'user1' }] };
    service.getAllUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users).toEqual(dummyUsers.data);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(dummyUsers);
  });

  it('should fetch a single user', () => {
    const dummyUser = { status: 'success', data: { cn: 'user1' } };
    service.getUser('user1').subscribe(user => {
      expect(user).toEqual(dummyUser.data);
    });
    const req = httpMock.expectOne('http://localhost:3000/api/users/user1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyUser);
  });

  it('should create a user', () => {
    const dummyRes = { status: 'success' };
    service.createUser('jdoe', 'John', 'Doe', 'jdoe@test.com', 'Pass123', true).subscribe(res => {
      expect(res).toEqual(dummyRes);
    });
    const req = httpMock.expectOne('http://localhost:3000/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'jdoe', firstName: 'John', lastName: 'Doe', email: 'jdoe@test.com', password: 'Pass123', forcePasswordChange: true
    });
    req.flush(dummyRes);
  });

  it('should update a user', () => {
    const dummyRes = { status: 'success' };
    service.updateUser('jdoe', { firstName: 'Johnny' }).subscribe(res => {
      expect(res).toEqual(dummyRes);
    });
    const req = httpMock.expectOne('http://localhost:3000/api/users/jdoe');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ firstName: 'Johnny' });
    req.flush(dummyRes);
  });

  it('should delete a user', () => {
    const dummyRes = { status: 'success' };
    service.deleteUser('jdoe').subscribe(res => {
      expect(res).toEqual(dummyRes);
    });
    const req = httpMock.expectOne('http://localhost:3000/api/users/jdoe');
    expect(req.request.method).toBe('DELETE');
    req.flush(dummyRes);
  });

  it('should toggle user status to disabled', () => {
    const dummyRes = { status: 'success' };
    service.toggleUserStatus('jdoe', false).subscribe(res => {
      expect(res).toEqual(dummyRes);
    });
    const req = httpMock.expectOne('http://localhost:3000/api/users/jdoe/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ enable: false });
    req.flush(dummyRes);
  });
});
