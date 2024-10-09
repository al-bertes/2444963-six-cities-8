import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';

import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { SortType } from '../../types/sort-type.enum.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DEFAULT_OFFER_COUNT } from './offer.constant.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.name}`);

    return result;
  }

  public async find(): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({DEFAULT_OFFER_COUNT})
      .populate(['userId'])
      .exec();
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findById(offerId)
      .populate(['userId'])
      .exec();
  }

  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndDelete(offerId)
      .exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, dto, {new: true})
      .populate(['userId'])
      .exec();
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel
      .exists({_id: documentId})) !== null;
  }

  public async incCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, {'$inc': {
        commentCount: 1,
      }}).exec();
  }

  public async findFavorite(count: number): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ favorite: true })
      .sort({ createdAt: SortType.Down })
      .limit(count)
      .populate(['userId'])
      .exec();
  }

  public async findPremium(
    count: number
  ): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ premium: true })
      .sort({ commentCount: SortType.Down })
      .limit(count)
      .populate(['userId'])
      .exec();
  }

  public async calculateRating(offerId: string, newRating: number): Promise<DocumentType<OfferEntity> | null> {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      return null;
    }

    const totalRatings = offer.rating * offer.commentCount;
    const newTotalRatings = totalRatings + newRating;
    const newCommentCount = offer.commentCount + 1;

    const updatedRating = newTotalRatings / newCommentCount;

    return this.offerModel.findByIdAndUpdate(
      offerId,
      {
        rating: updatedRating,
        commentCount: newCommentCount,
      },
      { new: true }
    ).exec();
  }
}
