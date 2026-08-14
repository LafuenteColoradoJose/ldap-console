import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MembersDialog } from './members-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { expect, vi } from 'vitest';
import { UserService } from '../../core/services/user.service';
import { GroupService } from '../../core/services/group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

describe('MembersDialog', () => {
  let component: MembersDialog;
  let fixture: ComponentFixture<MembersDialog>;
  let dialogRefMock: any;
  let userServiceMock: any;
  let groupServiceMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    
    userServiceMock = {
      getAllUsers: vi.fn().mockReturnValue(of([
        { attributes: [{ type: 'cn', values: ['user1'] }, { type: 'sAMAccountName', values: ['usr1'] }] },
        { attributes: [{ type: 'cn', values: ['user2'] }, { type: 'givenName', values: ['John'] }, { type: 'sn', values: ['Doe'] }, { type: 'sAMAccountName', values: ['usr2'] }] }
      ]))
    };

    groupServiceMock = {
      addMember: vi.fn().mockReturnValue(of({ status: 'success' })),
      removeMember: vi.fn().mockReturnValue(of({ status: 'success' }))
    };

    snackBarMock = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MembersDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { 
          provide: MAT_DIALOG_DATA, 
          useValue: { groupName: 'Admins', members: ['CN=User1,CN=Users,DC=corp,DC=local'] } 
        },
        { provide: UserService, useValue: userServiceMock },
        { provide: GroupService, useValue: groupServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MembersDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and fetch users', () => {
    expect(component).toBeTruthy();
    expect(userServiceMock.getAllUsers).toHaveBeenCalled();
    expect(component.allUsers.length).toBe(2);
    expect(component.filteredUsers.length).toBe(2);
    expect(component.currentMembers.has('user1')).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should handle error when fetching users', () => {
    userServiceMock.getAllUsers.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.fetchUsers();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
  });

  it('should filter users', () => {
    component.searchQuery = 'John';
    component.filterUsers();
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].name).toBe('John Doe');
    
    component.searchQuery = '';
    component.filterUsers();
    expect(component.filteredUsers.length).toBe(2);
  });

  it('should toggle membership add', () => {
    const user = { cn: 'user2', name: 'John Doe' };
    component.toggleMembership(user, true);
    
    expect(groupServiceMock.addMember).toHaveBeenCalledWith('Admins', 'user2');
    expect(component.currentMembers.has('user2')).toBe(true);
    expect(snackBarMock.open).toHaveBeenCalledWith('John Doe añadido al grupo', 'OK', { duration: 2000 });
  });

  it('should toggle membership remove', () => {
    const user = { cn: 'user1', name: 'user1' };
    component.toggleMembership(user, false);
    
    expect(groupServiceMock.removeMember).toHaveBeenCalledWith('Admins', 'user1');
    expect(component.currentMembers.has('user1')).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalledWith('user1 eliminado del grupo', 'OK', { duration: 2000 });
  });

  it('should handle error on membership add', () => {
    const user = { cn: 'user2', name: 'John Doe' };
    groupServiceMock.addMember.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.toggleMembership(user, true);
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al añadir miembro', 'OK', { duration: 3000 });
  });

  it('should handle error on membership remove', () => {
    const user = { cn: 'user1', name: 'user1' };
    groupServiceMock.removeMember.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.toggleMembership(user, false);
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al eliminar miembro', 'OK', { duration: 3000 });
  });
});
