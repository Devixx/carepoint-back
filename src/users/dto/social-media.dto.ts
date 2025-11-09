import { IsString, IsOptional, IsUrl } from "class-validator";

export class SocialMediaDto {
  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  twitter?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;
}

