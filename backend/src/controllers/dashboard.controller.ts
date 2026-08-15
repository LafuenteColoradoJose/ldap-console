import { Request, Response } from 'express';
import { UserService } from '../services/ldap/user.service';
import { GroupService } from '../services/ldap/group.service';
import { ComputerService } from '../services/ldap/computer.service';
import { OuService } from '../services/ldap/ou.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Fetches users, groups, and computers concurrently
    const [users, groups, computers, allOus] = await Promise.all([
      UserService.getAllUsers(),
      GroupService.getAllGroups(),
      ComputerService.getAllComputers(),
      OuService.getAllOUs()
    ]);

    const totalUsers = users.length;
    
    // Calculate last logon for users
    const usersWithLogon = users.map((u: any) => {
      const lastLogonAttr = u.attributes?.find((a: any) => a.type === 'lastLogon');
      const lastLogon = lastLogonAttr?.values?.[0];
      let jsTime = 0;
      if (lastLogon && lastLogon !== '0') {
        const fileTime = parseInt(lastLogon, 10);
        if (!isNaN(fileTime)) {
          jsTime = (fileTime / 10000) - 11644473600000;
        }
      }
      return {
        username: u.attributes?.find((a: any) => a.type === 'sAMAccountName')?.values?.[0] || 'Unknown',
        fullName: u.attributes?.find((a: any) => a.type === 'cn')?.values?.[0] || 'Unknown',
        lastLogonTs: jsTime
      };
    });

    const onlineUsers = usersWithLogon.filter(u => u.lastLogonTs > 0 && (Date.now() - u.lastLogonTs) < 30 * 60 * 1000).length;
    
    // Sort users by recent logon
    const recentLogins = usersWithLogon
      .filter(u => u.lastLogonTs > 0)
      .sort((a, b) => b.lastLogonTs - a.lastLogonTs)
      .slice(0, 5);

    const totalGroups = groups.length;

    const totalComputers = computers.length;
    const onlineComputers = computers.filter(c => c.isOnline).length;
    
    // Total OUs (filtering out users and groups from the tree response)
    const totalOus = allOus.filter(o => {
      const objClassAttr = o.attributes?.find((a: any) => a.type === 'objectClass');
      return objClassAttr && objClassAttr.values?.includes('organizationalUnit');
    }).length;
    
    // OS Distribution
    const osStats = computers.reduce((acc: any, comp: any) => {
      const os = comp.operatingSystem || 'Desconocido';
      // Normalize OS names slightly
      let osCategory = 'Otros';
      if (os.toLowerCase().includes('windows 10') || os.toLowerCase().includes('windows 11')) {
        osCategory = 'Windows Client';
      } else if (os.toLowerCase().includes('windows server')) {
        osCategory = 'Windows Server';
      } else if (os.toLowerCase().includes('linux') || os.toLowerCase().includes('ubuntu') || os.toLowerCase().includes('debian')) {
        osCategory = 'Linux';
      } else if (os !== 'Desconocido') {
        osCategory = os;
      }
      
      acc[osCategory] = (acc[osCategory] || 0) + 1;
      return acc;
    }, {});

    res.json({
      status: 'success',
      data: {
        users: { total: totalUsers, online: onlineUsers, recent: recentLogins },
        groups: { total: totalGroups },
        ous: { total: totalOus },
        computers: { total: totalComputers, online: onlineComputers, osStats }
      }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Error del servidor' });
  }
};
