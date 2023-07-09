import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from './enums/task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService', { timestamp: true });
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.taskRepository.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (err) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        err.stack,
      );
      throw new InternalServerErrorException();
    }
  }
  async getTaskById(id: string, user: User) {
    const foundTask = await this.taskRepository.findOne({
      where: { id, user },
    });

    if (!foundTask) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return foundTask;
  }
  async createTask(createTaskDto: CreateTaskDto, user: User) {
    const { title, description } = createTaskDto;

    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.taskRepository.save(task);
    return task;
  }

  async deleteTask(id: string, user: User) {
    const result = await this.taskRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus, user: User) {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.taskRepository.save(task);
    return task;
  }
}
