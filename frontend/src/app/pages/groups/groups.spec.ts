import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Groups } from './groups';
import { GroupService } from '../../core/services/group.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { vi, expect } from 'vitest';
import { ChangeDetectorRef } from '@angular/core';

describe('Groups', () => {
  let component: Groups;
  let fixture: ComponentFixture<Groups>;
  let groupServiceMock: any;
  let dialogMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    groupServiceMock = {
      getAllGroups: vi.fn().mockReturnValue(of([{ sAMAccountName: 'Admins', description: 'Admin Group' }])),
      updateGroup: vi.fn().mockReturnValue(of({ status: 'success' })),
      createGroup: vi.fn().mockReturnValue(of({ status: 'success' })),
      deleteGroup: vi.fn().mockReturnValue(of({ status: 'success' }))
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
      imports: [Groups],
      providers: [
        { provide: GroupService, useValue: groupServiceMock }
      ]
    })
    .overrideComponent(Groups, {
      add: {
        providers: [
          { provide: MatDialog, useValue: dialogMock },
          { provide: MatSnackBar, useValue: snackBarMock }
        ]
      }
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Groups);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch groups successfully', () => {
    component.fetchGroups();
    expect(groupServiceMock.getAllGroups).toHaveBeenCalled();
    expect(component.groups().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should handle error when fetching groups', () => {
    groupServiceMock.getAllGroups.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.fetchGroups();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al cargar grupos', 'Cerrar', { duration: 3000 });
    expect(component.loading()).toBe(false);
  });

  it('should get group value', () => {
    const group = { attributes: [{ type: 'sAMAccountName', values: ['Admins'] }] };
    expect(component.getGroupValue(group, 'sAMAccountName')).toBe('Admins');
    expect(component.getGroupValue(group, 'description')).toBe('');
    
    const groupMultiple = { attributes: [{ type: 'member', values: ['User1', 'User2'] }] };
    expect(component.getGroupValue(groupMultiple, 'member', true)).toEqual(['User1', 'User2']);
  });

  it('should delete group if confirmed', () => {
    component.deleteGroup('Admins');
    expect(groupServiceMock.deleteGroup).toHaveBeenCalledWith('Admins');
    expect(snackBarMock.open).toHaveBeenCalledWith('Grupo Admins eliminado.', 'Cerrar', { duration: 3000 });
    expect(groupServiceMock.getAllGroups).toHaveBeenCalledTimes(2);
  });

  it('should not delete group if not confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    component.deleteGroup('Admins');
    expect(groupServiceMock.deleteGroup).not.toHaveBeenCalled();
  });

  it('should open edit dialog and update group on save', () => {
    const dialogResult = { name: 'Admins', description: 'New Desc' };
    dialogMock.open.mockReturnValueOnce({ afterClosed: () => of(dialogResult) });
    
    const group = { attributes: [{ type: 'sAMAccountName', values: ['Admins'] }] };
    component.openGroupDialog(group);
    
    expect(dialogMock.open).toHaveBeenCalled();
    expect(groupServiceMock.updateGroup).toHaveBeenCalledWith('Admins', 'New Desc');
  });

  it('should handle error on update group', () => {
    const dialogResult = { name: 'Admins', description: 'New Desc' };
    dialogMock.open.mockReturnValueOnce({ afterClosed: () => of(dialogResult) });
    groupServiceMock.updateGroup.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const group = { attributes: [{ type: 'sAMAccountName', values: ['Admins'] }] };
    component.openGroupDialog(group);
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al actualizar grupo', 'Cerrar', { duration: 3000 });
  });
  
  it('should open create dialog and create group on save', () => {
    const dialogResult = { name: 'NewGroup', description: 'Desc' };
    dialogMock.open.mockReturnValueOnce({ afterClosed: () => of(dialogResult) });
    
    component.openGroupDialog();
    
    expect(dialogMock.open).toHaveBeenCalled();
    expect(groupServiceMock.createGroup).toHaveBeenCalledWith('NewGroup', 'Desc');
  });

  it('should handle error on create group', () => {
    const dialogResult = { name: 'NewGroup', description: 'Desc' };
    dialogMock.open.mockReturnValueOnce({ afterClosed: () => of(dialogResult) });
    groupServiceMock.createGroup.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.openGroupDialog();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al crear grupo', 'Cerrar', { duration: 3000 });
  });

  it('should open members dialog and refresh on close', () => {
    const group = { attributes: [{ type: 'sAMAccountName', values: ['Admins'] }, { type: 'member', values: ['CN=jdoe'] }] };
    component.openMembersDialog(group);
    expect(dialogMock.open).toHaveBeenCalled();
    expect(groupServiceMock.getAllGroups).toHaveBeenCalledTimes(2); // Initial fetch + refresh
  });
});
