import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ous } from './ous';
import { OuService } from '../../core/services/ou.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { vi, expect } from 'vitest';

describe('Ous', () => {
  let component: Ous;
  let fixture: ComponentFixture<Ous>;
  let ouServiceMock: any;
  let dialogMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    ouServiceMock = {
      getAllOUs: vi.fn().mockReturnValue(of([
        { distinguishedName: 'OU=Test,DC=corp', ou: 'Test', type: 'ou' },
        { distinguishedName: 'CN=User,OU=Test,DC=corp', ou: 'User', type: 'user' }
      ])),
      updateOU: vi.fn().mockReturnValue(of({ status: 'success' })),
      createOU: vi.fn().mockReturnValue(of({ status: 'success' })),
      deleteOU: vi.fn().mockReturnValue(of({ status: 'success' }))
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
      imports: [Ous],
      providers: [
        { provide: OuService, useValue: ouServiceMock }
      ]
    })
    .overrideComponent(Ous, {
      add: {
        providers: [
          { provide: MatDialog, useValue: dialogMock },
          { provide: MatSnackBar, useValue: snackBarMock }
        ]
      }
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Ous);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch OUs and build tree successfully', () => {
    component.fetchOUs();
    expect(ouServiceMock.getAllOUs).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].children!.length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should handle error when fetching OUs', () => {
    ouServiceMock.getAllOUs.mockReturnValueOnce(throwError(() => new Error('Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    component.fetchOUs();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al cargar Unidades Organizativas', 'Cerrar', { duration: 3000 });
    expect(component.loading()).toBe(false);
  });

  it('should delete OU if confirmed', () => {
    component.deleteOu('OU=Test,DC=corp', 'Test');
    expect(ouServiceMock.deleteOU).toHaveBeenCalledWith('OU=Test,DC=corp');
    expect(snackBarMock.open).toHaveBeenCalledWith('OU Test eliminada.', 'Cerrar', { duration: 3000 });
  });

  it('should not delete OU if not confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    component.deleteOu('OU=Test,DC=corp', 'Test');
    expect(ouServiceMock.deleteOU).not.toHaveBeenCalled();
  });

  it('should open edit dialog and update OU on save', () => {
    const dialogResult = { name: 'Test', description: 'New Desc' };
    dialogMock.open.mockReturnValueOnce({ afterClosed: () => of(dialogResult) });
    
    const ouNode: any = { name: 'Test', dn: 'OU=Test,DC=corp', type: 'ou' };
    component.openOuDialog(ouNode);
    
    expect(dialogMock.open).toHaveBeenCalled();
    expect(ouServiceMock.updateOU).toHaveBeenCalledWith('OU=Test,DC=corp', 'New Desc');
  });

  it('should not open edit dialog if node is not an OU', () => {
    const ouNode: any = { name: 'User', dn: 'CN=User,DC=corp', type: 'user' };
    component.openOuDialog(ouNode);
    expect(dialogMock.open).not.toHaveBeenCalled();
  });

  it('should open create dialog and create OU on save', () => {
    const dialogResult = { name: 'NewOU', description: 'Desc', parentDN: 'OU=Test,DC=corp' };
    dialogMock.open.mockReturnValueOnce({ afterClosed: () => of(dialogResult) });
    
    const parentOu: any = { name: 'Test', dn: 'OU=Test,DC=corp', type: 'ou' };
    component.openOuDialog(undefined, parentOu);
    
    expect(dialogMock.open).toHaveBeenCalled();
    expect(ouServiceMock.createOU).toHaveBeenCalledWith('NewOU', 'Desc', 'OU=Test,DC=corp');
  });
});
