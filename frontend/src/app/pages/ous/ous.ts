import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OuService, OU } from '../../core/services/ou.service';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OuDialog } from './ou-dialog';

export interface OuNode {
  name: string;
  dn: string;
  description: string;
  type: 'ou' | 'user' | 'group' | 'unknown';
  isDisabled?: boolean;
  children?: OuNode[];
}

@Component({
  selector: 'app-ous',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './ous.html',
  styleUrl: './ous.scss'
})
export class Ous implements OnInit {
  private ouService = inject(OuService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  treeControl = new NestedTreeControl<OuNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<OuNode>();

  hasChild = (_: number, node: OuNode) => !!node.children && node.children.length > 0;

  ngOnInit() {
    this.fetchOUs();
  }

  fetchOUs() {
    this.loading.set(true);
    this.ouService.getAllOUs().subscribe({
      next: (ous) => {
        this.dataSource.data = this.buildTree(ous);
        this.treeControl.dataNodes = this.dataSource.data;
        this.treeControl.expandAll();
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al cargar Unidades Organizativas');
        this.loading.set(false);
      }
    });
  }

  buildTree(ous: OU[]): OuNode[] {
    const rootNodes: OuNode[] = [];
    const map = new Map<string, OuNode>();

    ous.forEach(ou => {
      map.set(ou.distinguishedName.toLowerCase(), {
        name: ou.ou,
        dn: ou.distinguishedName,
        description: ou.description || '',
        type: ou.type,
        isDisabled: ou.isDisabled,
        children: []
      });
    });

    ous.forEach(ou => {
      const node = map.get(ou.distinguishedName.toLowerCase())!;
      
      const parts = ou.distinguishedName.split(',');
      parts.shift(); // remove self
      const parentDN = parts.join(',').toLowerCase();
      
      const parent = map.get(parentDN);
      if (parent) {
        parent.children!.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    // Ordenar para que las OUs salgan primero, luego grupos, luego usuarios
    const sortNodes = (nodes: OuNode[]) => {
      nodes.sort((a, b) => {
        const typeOrder = { 'ou': 1, 'group': 2, 'user': 3, 'unknown': 4 };
        if (typeOrder[a.type] !== typeOrder[b.type]) {
          return typeOrder[a.type] - typeOrder[b.type];
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(n => {
        if (n.children && n.children.length > 0) {
          sortNodes(n.children);
        }
      });
    };
    
    sortNodes(rootNodes);
    return rootNodes;
  }

  openOuDialog(ou?: OuNode, parentOu?: OuNode) {
    if (ou && ou.type !== 'ou') return;
    
    const isEdit = !!ou;
    const dialogRef = this.dialog.open(OuDialog, {
      width: '400px',
      data: {
        isEdit,
        ou: isEdit ? { name: ou.name, description: ou.description, dn: ou.dn } : { name: '', description: '' },
        parentDN: parentOu ? parentOu.dn : undefined
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        if (isEdit) {
          this.ouService.updateOU(ou!.dn, result.description).subscribe({
            next: () => {
              this.showToast('OU actualizada correctamente');
              this.fetchOUs();
            },
            error: (err) => {
              console.error(err);
              this.showToast('Error al actualizar OU');
              this.loading.set(false);
            }
          });
        } else {
          this.ouService.createOU(result.name, result.description, result.parentDN).subscribe({
            next: () => {
              this.showToast('OU creada correctamente');
              this.fetchOUs();
            },
            error: (err) => {
              console.error(err);
              this.showToast('Error al crear OU');
              this.loading.set(false);
            }
          });
        }
      }
    });
  }

  deleteOu(dn: string, name: string) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la OU ${name}?`)) return;

    this.loading.set(true);
    this.ouService.deleteOU(dn).subscribe({
      next: () => {
        this.showToast(`OU ${name} eliminada.`);
        this.fetchOUs();
      },
      error: (err) => {
        console.error(err);
        this.showToast(`Error al eliminar: ${err.error?.message || err.message}`);
        this.loading.set(false);
      }
    });
  }

  private showToast(message: string) {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}
