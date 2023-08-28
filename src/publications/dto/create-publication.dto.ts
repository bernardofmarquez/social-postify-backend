import { IsDate, IsInt, IsNotEmpty, IsString } from "class-validator"

export class CreatePublicationDto {
  @IsInt()
  @IsNotEmpty()
  mediaId: number

  @IsInt()
  @IsNotEmpty()
  postId: number

  @IsString()
  @IsNotEmpty()
  date: string
}
