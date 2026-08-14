import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GroupService } from './group.service';

describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GroupService]
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all groups', () => {
    const dummyGroups = { status: 'success', data: [{ cn: 'Admins' }] };
    service.getAllGroups().subscribe(groups => {
      expect(groups.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/groups');
    expect(req.request.method).toBe('GET');
    req.flush(dummyGroups);
  });

  it('should get a single group', () => {
    const dummyGroup = { status: 'success', data: { cn: 'Admins' } };
    service.getGroup('Admins').subscribe(group => {
      expect(group.cn).toBe('Admins');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/groups/Admins');
    expect(req.request.method).toBe('GET');
    req.flush(dummyGroup);
  });

  it('should create a group', () => {
    const dummyRes = { status: 'success' };
    service.createGroup('NewGroup', 'Description').subscribe(res => {
      expect(res).toEqual(dummyRes);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/groups');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'NewGroup', description: 'Description' });
    req.flush(dummyRes);
  });

  it('should update a group', () => {
    const dummyRes = { status: 'success' };
    service.updateGroup('Admins', 'New Desc').subscribe(res => {
      expect(res).toEqual(dummyRes);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/groups/Admins');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ description: 'New Desc' });
    req.flush(dummyRes);
  });

  it('should delete a group', () => {
    const dummyRes = { status: 'success' };
    service.deleteGroup('Admins').subscribe(res => {
      expect(res).toEqual(dummyRes);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/groups/Admins');
    expect(req.request.method).toBe('DELETE');
    req.flush(dummyRes);
  });

  it('should add a member', () => {
    const dummyRes = { status: 'success' };
    service.addMember('Admins', 'jdoe').subscribe(res => {
      expect(res).toEqual(dummyRes);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/groups/Admins/members');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ memberCN: 'jdoe' });
    req.flush(dummyRes);
  });

  it('should remove a member', () => {
    const dummyRes = { status: 'success' };
    service.removeMember('Admins', 'jdoe').subscribe(res => {
      expect(res).toEqual(dummyRes);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/groups/Admins/members/jdoe');
    expect(req.request.method).toBe('DELETE');
    req.flush(dummyRes);
  });
});
