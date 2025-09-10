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
import { AppointmentsListQueryDto } from "./dto/appointments-list.query.dto";

@Controller("appointments")
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user);
  }

  // @Get()
  // findAll(@Request() req) {
  //   return this.appointmentsService.findAll(req.user);
  // }

  @Get("calendar/:date")
  getCalendarData(@Param("date") date: string, @Request() req) {
    return this.appointmentsService.getCalendarData(date, req.user.id);
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

  @Get()
  async list(@Request() req, @Query() query: AppointmentsListQueryDto) {
    const doctorId = req.user?.id || process.env.DEV_DOCTOR_ID;
    return this.appointmentsService.listByDoctor(
      doctorId,
      {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
        order: query.order,
      },
      { start: query.start, end: query.end },
    );
  }

  @Get("calendar/:date")
  async day(@Request() req, @Param("date") date: string) {
    const doctorId = req.user?.id || process.env.DEV_DOCTOR_ID;
    return this.appointmentsService.dayByDoctor(doctorId, date);
  }
}
