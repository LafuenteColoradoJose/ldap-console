import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoveDialog } from './move-dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OuService } from '../../../core/services/ou.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MoveDialog', () => {
  let component: MoveDialog;
  let fixture: ComponentFixture<MoveDialog>;
  let mockDialogRef: any;
  let mockOuService: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };

    mockOuService = {
      getAllOUs: vi.fn().mockReturnValue(of([
        { distinguishedName: 'OU=Ventas,DC=corp', type: 'ou' },
        { distinguishedName: 'OU=IT,DC=corp', type: 'ou' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [MoveDialog, BrowserAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { name: 'testuser', type: 'user', currentDN: 'CN=testuser,OU=Ventas,DC=corp' } },
        { provide: OuService, useValue: mockOuService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MoveDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load OUs and set loading to false', () => {
    expect(mockOuService.getAllOUs).toHaveBeenCalled();
    expect(component.ous().length).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('should extract parent DN correctly on init', () => {
    expect(component.selectedOU()).toBe('OU=Ventas,DC=corp');
  });
});
