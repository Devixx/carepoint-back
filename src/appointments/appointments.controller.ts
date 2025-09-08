import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("appointments")
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.appointmentsService.findAll(req.user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    return this.appointmentsService.findOne(id, req.user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, req.user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.appointmentsService.remove(id, req.user);
  }
}
