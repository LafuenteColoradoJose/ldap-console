import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserGroupsDialog } from './user-groups-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from 'vitest';

describe('UserGroupsDialog', () => {
  let component: UserGroupsDialog;
  let fixture: ComponentFixture<UserGroupsDialog>;
  let dialogRefMock: any;

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UserGroupsDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { 
          provide: MAT_DIALOG_DATA, 
          useValue: { userName: 'jdoe', groups: ['Group1', 'Group2'] } 
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserGroupsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.data.userName).toBe('jdoe');
    expect(component.data.groups.length).toBe(2);
  });
});
