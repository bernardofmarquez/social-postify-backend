import { IsString, IsNotEmpty, IsOptional} from "class-validator";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  text: string

  @IsString()
  @IsOptional()
  image: string
}
