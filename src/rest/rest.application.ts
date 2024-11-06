import { inject, injectable } from 'inversify';
import express, { Express } from 'express';

import { Logger } from '../shared/libs/logger/index.js';
import { Config, RestSchema } from '../shared/libs/config/index.js';
import { Component } from '../shared/types/index.js';
import { DatabaseClient } from '../shared/libs/database-client/index.js';
import { getMongoURI } from '../shared/helpers/index.js';
import { Controller, ExceptionFilter } from '../shared/libs/rest/index.js';
import { ParseTokenMiddleware } from '../shared/libs/rest/middleware/parse-token.middleware.js';

@injectable()
export class RestApplication {
  private readonly server: Express;
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.ExceptionFilter) private readonly appExceptionFilter: ExceptionFilter,
    @inject(Component.UserController) private readonly userController: Controller,
    @inject(Component.OfferController) private readonly offerController: Controller,
    @inject(Component.CommentController) private readonly commentController: Controller,
    @inject(Component.AuthExceptionFilter) private readonly authExceptionFilter: ExceptionFilter
  ) {
    this.server = express();
  }

  private async initDb() {
    this.logger.info('Application initialization');
    this.logger.info('Init database…');

    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME')
    );

    this.logger.info('Init database completed');
    return this.databaseClient.connect(mongoUri);
  }

  private _initServer() {
    const port = this.config.get('PORT');
    this.logger.info('Try to init server…');
    this.server.listen(port);
    this.logger.info(
      `🚀 Server started on http://localhost:${this.config.get('PORT')}`
    );
  }

  private _initControllers() {
    this.logger.info('Init controllers');
    this.server.use('/users', this.userController.router);
    this.server.use('/offers', this.offerController.router);
    this.server.use('/comments', this.commentController.router);
    this.logger.info('Controller initialization completed');
  }

  private _initMiddleware() {
    this.logger.info('Init app-level middleware');
    const authenticateMiddleware = new ParseTokenMiddleware(this.config.get('JWT_SECRET'));

    this.server.use(express.json());
    this.server.use(
      '/upload',
      express.static(this.config.get('UPLOAD_DIRECTORY'))
    );
    this.server.use(authenticateMiddleware.execute.bind(authenticateMiddleware));
    this.logger.info('App-level middleware initialization completed');
  }

  private _initExceptionFilters() {
    this.logger.info('Init exception filters');
    this.server.use(this.authExceptionFilter.catch.bind(this.authExceptionFilter));
    this.server.use(this.appExceptionFilter.catch.bind(this.appExceptionFilter));
    this.logger.info('Exception filters initialization compleated');
  }

  public async init() {
    await this.initDb();
    await this._initMiddleware();
    await this._initControllers();
    await this._initExceptionFilters();
    await this._initServer();
  }
}
