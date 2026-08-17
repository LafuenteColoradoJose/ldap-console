import { Request, Response } from 'express';
import { deployService } from '../services/deploy.service';

export class DeployController {
  async deployTelemetry(req: Request, res: Response) {
    try {
      const { host, username, password, privateKey } = req.body;
      
      if (!host || !username) {
        return res.status(400).json({ error: 'Host and username are required' });
      }
      
      if (!password && !privateKey) {
        return res.status(400).json({ error: 'Password or privateKey is required' });
      }

      const result = await deployService.deployTelemetryLinux(host, username, password, privateKey);
      res.json(result);
    } catch (error: any) {
      console.error('Deploy telemetry error:', error);
      res.status(500).json({ error: error.message || 'Error deploying telemetry' });
    }
  }
}

export const deployController = new DeployController();
