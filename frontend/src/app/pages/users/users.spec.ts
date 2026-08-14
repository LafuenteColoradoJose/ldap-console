import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Users } from './users';
import { UserService } from '../../core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { vi, expect } from 'vitest';
import { ChangeDetectorRef } from '@angular/core';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  let userServiceMock: any;
  let dialogMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    userServiceMock = {
      getAllUsers: vi.fn().mockReturnValue(of([{ cn: 'jdoe', givenName: 'John', sn: 'Doe' }])),
      updateUser: vi.fn().mockReturnValue(of({ status: 'success' })),
      createUser: vi.fn().mockReturnValue(of({ status: 'success' })),
      toggleUserStatus: vi.fn().mockReturnValue(of({ status: 'success' })),
      deleteUser: vi.fn().mockReturnValue(of({ status: 'success' }))
    };

    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(null)
      })
    };

    snackBarMock = {
      open: vi.fn()
    };

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        { provide: UserService, useValue: userServiceMock }
      ]
    })
    .overrideComponent(Users, {
      add: {
        providers: [
          { provide: MatDialog, useValue: dialogMock },
          { provide: MatSnackBar, useValue: snackBarMock }
        ]
      }
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch users successfully', () => {
    component.fetchUsers();
    expect(userServiceMock.getAllUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should handle error when fetching users', () => {
    userServiceMock.getAllUsers.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.fetchUsers();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
    expect(component.loading).toBe(false);
  });

  it('should get user value', () => {
    const user = { attributes: [{ type: 'sn', values: ['Doe'] }] };
    expect(component.getUserValue(user, 'sn')).toBe('Doe');
    expect(component.getUserValue(user, 'givenName')).toBe('');
    
    const userMultiple = { attributes: [{ type: 'memberOf', values: ['Group1', 'Group2'] }] };
    expect(component.getUserValue(userMultiple, 'memberOf', true)).toEqual(['Group1', 'Group2']);
  });

  it('should determine if user is disabled based on UAC', () => {
    const userDisabled = { attributes: [{ type: 'userAccountControl', values: ['514'] }] }; // 512 + 2
    const userEnabled = { attributes: [{ type: 'userAccountControl', values: ['512'] }] };
    
    expect(component.isUserDisabled(userDisabled)).toBe(true);
    expect(component.isUserDisabled(userEnabled)).toBe(false);
  });

  it('should toggle user status', () => {
    const user = { attributes: [{ type: 'cn', values: ['jdoe'] }, { type: 'userAccountControl', values: ['512'] }] };
    component.toggleStatus(user);
    expect(userServiceMock.toggleUserStatus).toHaveBeenCalledWith('jdoe', false);
    expect(snackBarMock.open).toHaveBeenCalledWith('Usuario deshabilitado.', 'Cerrar', { duration: 3000 });
    expect(userServiceMock.getAllUsers).toHaveBeenCalledTimes(2); // 1 en init, 1 tras toggle
  });

  it('should handle error on toggle user status', () => {
    const user = { attributes: [{ type: 'cn', values: ['jdoe'] }, { type: 'userAccountControl', values: ['512'] }] };
    userServiceMock.toggleUserStatus.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.toggleStatus(user);
    expect(consoleSpy).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should delete user if confirmed', () => {
    component.deleteUser('jdoe');
    expect(userServiceMock.deleteUser).toHaveBeenCalledWith('jdoe');
    expect(snackBarMock.open).toHaveBeenCalledWith('Usuario eliminado.', 'Cerrar', { duration: 3000 });
    expect(userServiceMock.getAllUsers).toHaveBeenCalledTimes(2);
  });

  it('should not delete user if not confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    component.deleteUser('jdoe');
    expect(userServiceMock.deleteUser).not.toHaveBeenCalled();
  });

  it('should format last logon properly', () => {
    expect(component.formatLastLogon({})).toBe('Nunca');
    expect(component.formatLastLogon({ attributes: [{ type: 'lastLogon', values: ['0'] }] })).toBe('Nunca');
    expect(component.formatLastLogon({ attributes: [{ type: 'lastLogon', values: ['invalid'] }] })).toBe('Desconocido');
    
    // Windows file time for a specific date
    expect(component.formatLastLogon({ attributes: [{ type: 'lastLogon', values: ['133314048000000000'] }] })).toContain('2023'); // Approximate test
  });

  it('should calculate if user is online', () => {
    expect(component.isUserOnline({})).toBe(false);
    
    // Get current Windows FileTime
    const nowJsTime = Date.now();
    const nowFileTime = (nowJsTime + 11644473600000) * 10000;
    
    expect(component.isUserOnline({ attributes: [{ type: 'lastLogon', values: [nowFileTime.toString()] }] })).toBe(true);
    
    // 40 mins ago
    const pastJsTime = Date.now() - (40 * 60 * 1000);
    const pastFileTime = (pastJsTime + 11644473600000) * 10000;
    
    expect(component.isUserOnline({ attributes: [{ type: 'lastLogon', values: [pastFileTime.toString()] }] })).toBe(false);
  });
  
  it('should open edit dialog and update user on save', () => {
    const dialogResult = { firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com' };
    dialogMock.open.mockReturnValueOnce({ afterClosed: () => of(dialogResult) });
    
    const user = { attributes: [{ type: 'cn', values: ['jdoe'] }] };
    component.openUserDialog(user);
    
    expect(dialogMock.open).toHaveBeenCalled();
    expect(userServiceMock.updateUser).toHaveBeenCalledWith('jdoe', dialogResult);
  });
  
  it('should open create dialog and create user on save', () => {
    const dialogResult = { username: 'jdoe2', firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com', password: 'pwd', forcePasswordChange: true };
    dialogMock.open.mockReturnValueOnce({ afterClosed: () => of(dialogResult) });
    
    component.openUserDialog();
    
    expect(dialogMock.open).toHaveBeenCalled();
    expect(userServiceMock.createUser).toHaveBeenCalledWith('jdoe2', 'Jane', 'Doe', 'jane@test.com', 'pwd', true);
  });

  it('should open user groups dialog', () => {
    const user = { attributes: [{ type: 'cn', values: ['jdoe'] }, { type: 'memberOf', values: ['CN=Admins,CN=Users,DC=corp,DC=local'] }] };
    component.openUserGroupsDialog(user);
    expect(dialogMock.open).toHaveBeenCalled();
  });
});
