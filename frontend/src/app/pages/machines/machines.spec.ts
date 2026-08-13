import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Machines } from './machines';
import { ComputerService } from '../../core/services/computer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('MachinesComponent', () => {
  let component: Machines;
  let fixture: ComponentFixture<Machines>;
  let mockComputerService: any;

  beforeEach(async () => {
    mockComputerService = {
      getAllComputers: vi.fn().mockReturnValue(of([
        {
          dn: 'CN=TEST-PC,CN=Computers,DC=corp,DC=local',
          cn: 'TEST-PC',
          dNSHostName: 'TEST-PC.corp.local',
          operatingSystem: 'Windows 10 Pro',
          operatingSystemVersion: '10.0 (19045)',
          whenCreated: '20260813095024.0Z',
          isOnline: true
        }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [Machines, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        DatePipe,
        { provide: ComputerService, useValue: mockComputerService }
      ]
    })
    .compileComponents();
    
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Machines);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar la lista de ordenadores al iniciarse', () => {
    expect(mockComputerService.getAllComputers).toHaveBeenCalled();
    expect(component.computers.length).toBe(1);
    expect(component.computers[0].cn).toBe('TEST-PC');
    expect(component.loading).toBe(false);
  });

  it('debería formatear la fecha correctamente', () => {
    const formatted = component.formatDate('20260813095024.0Z');
    expect(formatted).toBe('13/08/2026');
  });
});

