import { Request, Response } from 'express';
import { UserService } from '../services/ldap/user.service';
import { GroupService } from '../services/ldap/group.service';
import { ComputerService } from '../services/ldap/computer.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Fetches users, groups, and computers concurrently
    const [users, groups, computers] = await Promise.all([
      UserService.getAllUsers(),
      GroupService.getAllGroups(),
      ComputerService.getAllComputers()
    ]);

    const totalUsers = users.length;
    const onlineUsers = users.filter((u: any) => {
      const lastLogonAttr = u.attributes?.find((a: any) => a.type === 'lastLogon');
      const lastLogon = lastLogonAttr?.values?.[0];
      if (!lastLogon || lastLogon === '0') return false;
      const fileTime = parseInt(lastLogon, 10);
      if (isNaN(fileTime)) return false;
      const jsTime = (fileTime / 10000) - 11644473600000;
      return (Date.now() - jsTime) < 30 * 60 * 1000; // 30 minutes
    }).length;

    const totalGroups = groups.length;

    const totalComputers = computers.length;
    const onlineComputers = computers.filter(c => c.isOnline).length;

    res.json({
      status: 'success',
      data: {
        users: { total: totalUsers, online: onlineUsers },
        groups: { total: totalGroups },
        computers: { total: totalComputers, online: onlineComputers }
      }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Error del servidor' });
  }
};
