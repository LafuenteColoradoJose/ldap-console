import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
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
import { UserService } from '../../core/services/user.service';
import { GroupService } from '../../core/services/group.service';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';

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
    MatTooltipModule,
    FormsModule,
    MatSlideToggleModule,
    MatInputModule
  ],
  templateUrl: './ous.html',
  styleUrl: './ous.scss'
})
export class Ous implements OnInit {
  private ouService = inject(OuService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private cdr = inject(ChangeDetectorRef);

  // Tree variables
  loading = signal(true);
  treeControl = new NestedTreeControl<OuNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<OuNode>();

  hasChild = (_: number, node: OuNode) => !!node.children && node.children.length > 0;

  // Drawer variables
  drawerOpen = false;
  selectedGroup: any = null;
  drawerLoading = false;
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  searchQuery = '';
  currentMembers: Set<string> = new Set();
  toggling: { [key: string]: boolean } = {};

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

    const normalizeDN = (dn: string) => dn.toLowerCase().replace(/,\s*/g, ',');

    ous.forEach(ou => {
      map.set(normalizeDN(ou.distinguishedName), {
        name: ou.ou,
        dn: ou.distinguishedName,
        description: ou.description || '',
        type: ou.type,
        isDisabled: ou.isDisabled,
        children: []
      });
    });

    ous.forEach(ou => {
      const normDN = normalizeDN(ou.distinguishedName);
      const node = map.get(normDN)!;
      
      const parts = normDN.split(',');
      parts.shift(); // remove self
      const parentDN = parts.join(',');
      
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

  // --- Drawer Logic ---

  openGroupDrawer(node: OuNode) {
    if (node.type !== 'group') return;
    this.selectedGroup = node;
    this.drawerOpen = true;
    this.drawerLoading = true;
    this.searchQuery = '';
    
    // Fetch group details to get members
    this.groupService.getGroup(node.name).subscribe({
      next: (group) => {
        const memberAttr = group.attributes?.find((a: any) => a.type === 'member');
        const members = memberAttr?.values || [];
        this.parseCurrentMembers(members);
        
        // Fetch users if not loaded yet
        if (this.allUsers.length === 0) {
          this.fetchUsersForDrawer();
        } else {
          this.filterUsers();
          this.drawerLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al obtener datos del grupo');
        this.drawerLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDrawer() {
    this.drawerOpen = false;
    this.selectedGroup = null;
  }

  parseCurrentMembers(members: string[]) {
    this.currentMembers.clear();
    members.forEach(dn => {
      const match = dn.match(/CN=([^,]+)/i);
      if (match && match[1]) {
        this.currentMembers.add(match[1].toLowerCase());
      }
    });
  }

  fetchUsersForDrawer() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        const usersArray = Array.isArray(data) ? data : [];
        this.allUsers = usersArray.map((u: any) => {
          const cn = u.attributes?.find((a: any) => a.type === 'cn')?.values?.[0] || '';
          const gn = u.attributes?.find((a: any) => a.type === 'givenName')?.values?.[0] || '';
          const sn = u.attributes?.find((a: any) => a.type === 'sn')?.values?.[0] || '';
          const username = u.attributes?.find((a: any) => a.type === 'sAMAccountName')?.values?.[0] || '';
          return {
            cn,
            name: gn || sn ? (gn + ' ' + sn).trim() : cn,
            username
          };
        });
        
        this.allUsers.sort((a, b) => a.name.localeCompare(b.name));
        this.filterUsers();
        this.drawerLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al cargar usuarios');
        this.drawerLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterUsers() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.username.toLowerCase().includes(query)
      );
    }
  }

  isMember(user: any): boolean {
    return this.currentMembers.has(user.cn.toLowerCase());
  }

  toggleMembership(user: any, add: boolean) {
    if (!this.selectedGroup) return;
    
    this.toggling[user.cn] = true;
    const groupName = this.selectedGroup.name;
    
    if (add) {
      this.groupService.addMember(groupName, user.cn).subscribe({
        next: () => {
          this.currentMembers.add(user.cn.toLowerCase());
          this.toggling[user.cn] = false;
          this.showToast(user.name + ' añadido al grupo');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toggling[user.cn] = false;
          this.showToast('Error al añadir miembro');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.groupService.removeMember(groupName, user.cn).subscribe({
        next: () => {
          this.currentMembers.delete(user.cn.toLowerCase());
          this.toggling[user.cn] = false;
          this.showToast(user.name + ' eliminado del grupo');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toggling[user.cn] = false;
          this.showToast('Error al eliminar miembro');
          this.cdr.detectChanges();
        }
      });
    }
  }
}
