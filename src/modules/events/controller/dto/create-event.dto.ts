import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

import type {
  EventType,
  EventRecurrence,
} from '../../application/models/event.js';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'name must contain a non-whitespace character' })
  name!: string;

  @IsString()
  description!: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(9999)
  year?: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  day!: number;

  @IsIn(['birthday', 'other'])
  type!: EventType;

  @IsIn(['yearly', 'none'])
  recurrence!: EventRecurrence;

  @IsBoolean()
  isActive!: boolean;
}
