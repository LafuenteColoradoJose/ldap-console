import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDialog } from './group-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from 'vitest';

describe('GroupDialog', () => {
  let component: GroupDialog;
  let fixture: ComponentFixture<GroupDialog>;
  let dialogRefMock: any;

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [GroupDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { 
          provide: MAT_DIALOG_DATA, 
          useValue: { 
            isEdit: false, 
            group: { name: 'Admins', description: 'Admin group' } 
          } 
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.group.name).toBe('Admins');
  });
});
