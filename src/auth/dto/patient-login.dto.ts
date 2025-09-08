import { IsEmail, IsString } from "class-validator";

export class PatientLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
