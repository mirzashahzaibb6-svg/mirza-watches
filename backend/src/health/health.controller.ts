import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('healthz')
  checkHealth() {
    return {
      status: 'ok',
      message: 'MIRZA backend is running',
    };
  }
}