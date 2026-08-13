import { Request, Response } from 'express';
import { ComputerService } from '../services/ldap/computer.service';

export class ComputerController {
  static async getAllComputers(req: Request, res: Response) {
    try {
      const computers = await ComputerService.getAllComputers();
      res.json(computers);
    } catch (error) {
      console.error('Error fetching computers:', error);
      res.status(500).json({ error: 'Error fetching computers' });
    }
  }
}
