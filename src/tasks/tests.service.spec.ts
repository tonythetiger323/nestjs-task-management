import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockTaskRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: MockRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository() },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<MockRepository>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  describe('getTasks', () => {
    it('calls');
  });
});
