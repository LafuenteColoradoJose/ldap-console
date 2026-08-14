import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDialog } from './user-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from 'vitest';

describe('UserDialog', () => {
  let component: UserDialog;
  let fixture: ComponentFixture<UserDialog>;
  let dialogRefMock: any;

  beforeEach(async () => {
    dialogRefMock = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { 
          provide: MAT_DIALOG_DATA, 
          useValue: { 
            isEdit: false, 
            user: { username: '', firstName: '', lastName: '', email: '' } 
          } 
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in create mode', () => {
    expect(component).toBeTruthy();
    expect(component.user.forcePasswordChange).toBe(true);
  });

  it('should validate form in create mode', () => {
    component.user = { username: '', firstName: '', lastName: '', password: '' };
    expect(component.isValid()).toBe(false);
    
    component.user = { username: 'test', firstName: 'Test', lastName: 'User', password: 'pwd' };
    expect(component.isValid()).toBe(true);
  });
});

describe('UserDialog (Edit Mode)', () => {
  let component: UserDialog;
  let fixture: ComponentFixture<UserDialog>;
  let dialogRefMock: any;

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UserDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { 
          provide: MAT_DIALOG_DATA, 
          useValue: { 
            isEdit: true, 
            user: { username: 'jdoe', firstName: 'John', lastName: 'Doe', email: 'j@d.com' } 
          } 
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should validate form in edit mode', () => {
    expect(component.isValid()).toBe(true);
    
    component.user.firstName = '';
    expect(component.isValid()).toBe(false);
  });
});
