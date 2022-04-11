import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CreateUserRequest } from './dto/user.dto';
import { UserCreatedEvent } from './events/user-created.event';

@Injectable()
export class AppService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
  ) {}
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(body: CreateUserRequest) {
    this.logger.log('Creating User', body);
    const userId = '123';
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(userId, body.email),
    );

    const establishWsTimeOut = setTimeout(
      () => this.establishWsConnection(userId),
      5000,
    );

    this.schedulerRegistry.addTimeout(
      `${userId}_establish_ws`,
      establishWsTimeOut,
    );
  }

  private establishWsConnection(userId: string) {
    this.logger.log('establishing WS with user...', userId);
  }

  @OnEvent('user.created')
  welcomeNewUser(payload: UserCreatedEvent) {
    this.logger.log('Welcoming new user...', payload.email);
  }

  @OnEvent('user.created', { async: true })
  async sendWelcomeGift(payload: UserCreatedEvent) {
    //Sending
    this.logger.log('Sending welcome gift...', payload.email);

    //Time sending
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));

    //End sending gift
    this.logger.log('Welcome gify sent.');
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'delete_expired_users' })
  deleteExpireUsers() {
    this.logger.log('Deleting expire users...');
  }
}
