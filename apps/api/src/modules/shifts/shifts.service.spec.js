require('ts-node/register');

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} = require('@nestjs/common');
const { Prisma } = require('@prisma/client');
const { CreateShiftDto } = require('./dto/create-shift.dto');
const { CreateShiftAssignmentDto } = require('./dto/create-shift-assignment.dto');
const { UpdateShiftDto } = require('./dto/update-shift.dto');
const { ShiftsService } = require('./shifts.service');
const { UserRole } = require('../platform/types/identity.types');

const timestamp = new Date('2026-10-29T00:00:00.000Z');

function makeExistingShift(overrides = {}) {
  return {
    id: 'shift-1',
    name: 'Evening',
    startTime: '22:00',
    endTime: '06:00',
    breakMinutes: 30,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function makeService(existing = makeExistingShift()) {
  let updateInput;
  const prisma = {
    shift: {
      create: async ({ data }) => ({ id: 'shift-new', ...data, createdAt: timestamp, updatedAt: timestamp }),
      findUnique: async () => existing,
      update: async (input) => {
        updateInput = input;
        return { ...existing, ...input.data, updatedAt: timestamp };
      },
    },
  };
  return { service: new ShiftsService(prisma), prisma, getUpdateInput: () => updateInput };
}

async function assertDtoInvalid(dto) {
  const errors = await validate(dto);
  assert.ok(errors.length > 0);
}

test('creates a valid overnight shift and defaults isActive to true', async () => {
  const { service } = makeService();
  const dto = plainToInstance(CreateShiftDto, {
    name: '  Night shift  ',
    startTime: '22:00',
    endTime: '06:00',
    breakMinutes: 60,
  });

  const result = await service.create(dto);

  assert.equal(result.name, 'Night shift');
  assert.equal(result.isActive, true);
  assert.equal(result.createdAt, timestamp.toISOString());
});

test('rejects an empty shift name', async () => {
  await assertDtoInvalid(plainToInstance(CreateShiftDto, {
    name: '   ', startTime: '09:00', endTime: '17:00', breakMinutes: 30,
  }));
});

test('rejects invalid 24-hour time formats', async () => {
  await assertDtoInvalid(plainToInstance(CreateShiftDto, {
    name: 'Invalid time', startTime: '24:00', endTime: '17:00', breakMinutes: 30,
  }));
  await assertDtoInvalid(plainToInstance(CreateShiftDto, {
    name: 'Invalid minute', startTime: '09:60', endTime: '17:00', breakMinutes: 30,
  }));
});

test('rejects negative and fractional break minutes', async () => {
  await assertDtoInvalid(plainToInstance(CreateShiftDto, {
    name: 'Negative break', startTime: '09:00', endTime: '17:00', breakMinutes: -1,
  }));
  await assertDtoInvalid(plainToInstance(CreateShiftDto, {
    name: 'Fractional break', startTime: '09:00', endTime: '17:00', breakMinutes: 10.5,
  }));
});

test('rejects equal start and end times', async () => {
  const { service } = makeService();
  const dto = plainToInstance(CreateShiftDto, {
    name: 'Zero or full day', startTime: '09:00', endTime: '09:00', breakMinutes: 0,
  });

  await assert.rejects(service.create(dto), BadRequestException);
});

test('rejects a break equal to the actual overnight duration', async () => {
  const { service } = makeService();
  const dto = plainToInstance(CreateShiftDto, {
    name: 'No work time', startTime: '22:00', endTime: '06:00', breakMinutes: 480,
  });

  await assert.rejects(service.create(dto), BadRequestException);
});

test('patches only submitted fields', async () => {
  const { service, getUpdateInput } = makeService();
  const dto = plainToInstance(UpdateShiftDto, { name: '  Late shift  ' });

  const result = await service.update('shift-1', dto);

  assert.equal(result.name, 'Late shift');
  assert.deepEqual(getUpdateInput().data, { name: 'Late shift' });
});

test('validates the merged current values when patching shift hours', async () => {
  const current = makeExistingShift({ breakMinutes: 60 });
  const { service, prisma } = makeService(current);
  const dto = plainToInstance(UpdateShiftDto, { endTime: '23:00' });

  await assert.rejects(service.update('shift-1', dto), BadRequestException);
  assert.equal(current.endTime, '06:00');
});

test('returns not found for a missing shift id', async () => {
  const { service } = makeService(null);
  const dto = plainToInstance(UpdateShiftDto, { isActive: false });

  await assert.rejects(service.update('missing', dto), NotFoundException);
});

function makeDeleteService({ shift, assignments = [], transactionError } = {}) {
  const calls = { deletes: [], updates: [] };
  let transactionOptions;
  const transaction = {
    shift: {
      findUnique: async () => shift,
      update: async (input) => {
        calls.updates.push(input);
        return { id: input.where.id, ...input.data };
      },
      delete: async (input) => {
        calls.deletes.push(input);
        return { id: input.where.id };
      },
    },
    shiftAssignment: {
      count: async () => assignments.length,
    },
  };
  const prisma = {
    $transaction: async (callback, options) => {
      transactionOptions = options;
      if (transactionError) throw transactionError;
      return callback(transaction);
    },
  };
  return {
    service: new ShiftsService(prisma),
    calls,
    getTransactionOptions: () => transactionOptions,
  };
}

test('hard-deletes a shift with no assignment inside a serializable transaction', async () => {
  const { service, calls, getTransactionOptions } = makeDeleteService({
    shift: { id: 'shift-1', isActive: true },
  });

  const result = await service.delete('shift-1');

  assert.deepEqual(result, { id: 'shift-1', isActive: null, deleted: true });
  assert.equal(calls.deletes.length, 1);
  assert.equal(calls.updates.length, 0);
  assert.equal(getTransactionOptions().isolationLevel, Prisma.TransactionIsolationLevel.Serializable);
});

test('soft-disables a shift with assignments and preserves assignment rows', async () => {
  const assignments = [{ id: 'assignment-1', shiftId: 'shift-1' }];
  const { service, calls } = makeDeleteService({
    shift: { id: 'shift-1', isActive: true },
    assignments,
  });

  const result = await service.delete('shift-1');

  assert.deepEqual(result, { id: 'shift-1', isActive: false, deleted: false });
  assert.equal(assignments.length, 1);
  assert.equal(calls.deletes.length, 0);
  assert.deepEqual(calls.updates[0].data, { isActive: false });
});

test('repeated delete is idempotent for an inactive shift that has assignments', async () => {
  const { service, calls } = makeDeleteService({
    shift: { id: 'shift-1', isActive: false },
    assignments: [{ id: 'assignment-1', shiftId: 'shift-1' }],
  });

  const result = await service.delete('shift-1');

  assert.deepEqual(result, { id: 'shift-1', isActive: false, deleted: false });
  assert.equal(calls.updates.length, 0);
  assert.equal(calls.deletes.length, 0);
});

test('returns not found for a missing shift', async () => {
  const { service } = makeDeleteService({ shift: null });

  await assert.rejects(service.delete('missing'), NotFoundException);
});

test('maps serializable transaction conflicts to a retryable business error', async () => {
  const transactionError = new Prisma.PrismaClientKnownRequestError('write conflict', {
    code: 'P2034',
    clientVersion: '5.22.0',
  });
  const { service } = makeDeleteService({ transactionError });

  await assert.rejects(service.delete('shift-1'), ConflictException);
});

test('maps a restrictive foreign-key failure to a clear business error', async () => {
  const transactionError = new Prisma.PrismaClientKnownRequestError('foreign key failure', {
    code: 'P2003',
    clientVersion: '5.22.0',
  });
  const { service } = makeDeleteService({ transactionError });

  await assert.rejects(service.delete('shift-1'), ConflictException);
});

function makeAssignmentService(overrides = {}) {
  const actorUser = overrides.actorUser ?? {
    id: 'manager-1', role: UserRole.MANAGER, isActive: true,
  };
  const employee = Object.hasOwn(overrides, 'employee')
    ? overrides.employee
    : { id: 'employee-1', role: UserRole.EMPLOYEE, isActive: true, managerId: 'manager-1' };
  const shift = Object.hasOwn(overrides, 'shift')
    ? overrides.shift
    : {
        id: 'shift-1', name: 'Day', startTime: '09:00', endTime: '17:00',
        breakMinutes: 60, isActive: true,
      };
  const existingAssignments = overrides.assignments ?? [];
  const duplicate = overrides.duplicate ?? null;
  const calls = { createInput: null, overlapQuery: null, transactionOptions: null };

  const transaction = {
    user: {
      findUnique: async ({ where }) => {
        if (where.id === actorUser.id) return actorUser;
        if (employee && where.id === employee.id) return employee;
        return null;
      },
    },
    shift: { findUnique: async () => shift },
    shiftAssignment: {
      findUnique: async () => duplicate,
      findMany: async (query) => {
        calls.overlapQuery = query;
        return existingAssignments;
      },
      create: async ({ data }) => {
        calls.createInput = { data };
        return {
          id: 'assignment-new',
          ...data,
          createdAt: timestamp,
          shift: {
            id: shift.id,
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            breakMinutes: shift.breakMinutes,
            isActive: shift.isActive,
          },
        };
      },
    },
  };

  const prisma = {
    $transaction: async (callback, options) => {
      calls.transactionOptions = options;
      if (overrides.transactionError) throw overrides.transactionError;
      return callback(transaction);
    },
  };

  return { service: new ShiftsService(prisma), calls };
}

function makeAssignmentDto(overrides = {}) {
  return plainToInstance(CreateShiftAssignmentDto, {
    shiftId: 'shift-1',
    employeeId: 'employee-1',
    workDate: '2026-10-29',
    ...overrides,
  });
}

const managerActor = { sub: 'manager-1', email: 'manager@example.test', role: UserRole.MANAGER };

test('creates assignment with actor id and a timezone-stable calendar date', async () => {
  const { service, calls } = makeAssignmentService();

  const result = await service.createAssignment(makeAssignmentDto(), managerActor);

  assert.equal(result.employeeId, 'employee-1');
  assert.equal(result.workDate, '2026-10-29');
  assert.equal(result.assignedById, managerActor.sub);
  assert.equal(result.shift.isActive, true);
  assert.equal(calls.createInput.data.workDate.toISOString(), '2026-10-29T00:00:00.000Z');
  assert.equal(calls.overlapQuery.where.workDate.gte.toISOString(), '2026-10-28T00:00:00.000Z');
  assert.equal(calls.overlapQuery.where.workDate.lte.toISOString(), '2026-10-30T00:00:00.000Z');
  assert.equal(calls.transactionOptions.isolationLevel, Prisma.TransactionIsolationLevel.Serializable);
});

test('rejects malformed and impossible calendar dates', async () => {
  for (const workDate of ['2026-2-09', '2026-02-29', '2026-13-01', '2026-04-31']) {
    const errors = await validate(makeAssignmentDto({ workDate }));
    assert.ok(errors.some((error) => error.property === 'workDate'), workDate);
  }
});

test('rejects empty assignment identifiers', async () => {
  const errors = await validate(makeAssignmentDto({ shiftId: ' ', employeeId: '' }));
  assert.ok(errors.some((error) => error.property === 'shiftId'));
  assert.ok(errors.some((error) => error.property === 'employeeId'));
});

test('returns not found when the shift does not exist', async () => {
  const { service } = makeAssignmentService({ shift: null });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto(), managerActor),
    NotFoundException,
  );
});

test('rejects assignments to a disabled shift', async () => {
  const { service } = makeAssignmentService({ shift: {
    id: 'shift-1', name: 'Disabled', startTime: '09:00', endTime: '17:00',
    breakMinutes: 30, isActive: false,
  } });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto(), managerActor),
    BadRequestException,
  );
});

test('returns not found when the employee does not exist', async () => {
  const { service } = makeAssignmentService({ employee: null });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto(), managerActor),
    NotFoundException,
  );
});

test('rejects inactive employees and users outside the EMPLOYEE role', async () => {
  const inactive = makeAssignmentService({ employee: {
    id: 'employee-1', role: UserRole.EMPLOYEE, isActive: false, managerId: 'manager-1',
  } });
  await assert.rejects(
    inactive.service.createAssignment(makeAssignmentDto(), managerActor),
    BadRequestException,
  );

  const managerRecipient = makeAssignmentService({ employee: {
    id: 'employee-1', role: UserRole.MANAGER, isActive: true, managerId: 'manager-1',
  } });
  await assert.rejects(
    managerRecipient.service.createAssignment(makeAssignmentDto(), managerActor),
    BadRequestException,
  );
});

test('rejects a manager assignment outside their direct reports', async () => {
  const { service } = makeAssignmentService({ employee: {
    id: 'employee-1', role: UserRole.EMPLOYEE, isActive: true, managerId: 'another-manager',
  } });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto(), managerActor),
    ForbiddenException,
  );
});

test('rejects an existing employee-shift-date duplicate', async () => {
  const { service, calls } = makeAssignmentService({ duplicate: { id: 'assignment-existing' } });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto(), managerActor),
    ConflictException,
  );
  assert.equal(calls.createInput, null);
});

test('rejects overlapping assignments on the same day', async () => {
  const { service } = makeAssignmentService({
    shift: {
      id: 'shift-2', name: 'Evening', startTime: '16:00', endTime: '20:00',
      breakMinutes: 0, isActive: true,
    },
    assignments: [{
      id: 'assignment-existing',
      workDate: new Date('2026-10-29T00:00:00.000Z'),
      shift: { startTime: '09:00', endTime: '17:00' },
    }],
  });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto({ shiftId: 'shift-2' }), managerActor),
    ConflictException,
  );
});

test('detects a new overnight shift overlapping an existing next-day shift', async () => {
  const { service } = makeAssignmentService({
    shift: {
      id: 'shift-night', name: 'Night', startTime: '22:00', endTime: '06:00',
      breakMinutes: 30, isActive: true,
    },
    assignments: [{
      id: 'assignment-next-day',
      workDate: new Date('2026-10-30T00:00:00.000Z'),
      shift: { startTime: '05:00', endTime: '09:00' },
    }],
  });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto({ shiftId: 'shift-night' }), managerActor),
    ConflictException,
  );
});

test('detects a previous-day overnight shift overlapping the requested date', async () => {
  const { service } = makeAssignmentService({
    shift: {
      id: 'shift-morning', name: 'Morning', startTime: '05:00', endTime: '10:00',
      breakMinutes: 0, isActive: true,
    },
    assignments: [{
      id: 'assignment-previous-day',
      workDate: new Date('2026-10-28T00:00:00.000Z'),
      shift: { startTime: '22:00', endTime: '06:00' },
    }],
  });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto({ shiftId: 'shift-morning' }), managerActor),
    ConflictException,
  );
});

test('allows shifts that touch exactly without overlapping', async () => {
  const { service } = makeAssignmentService({
    shift: {
      id: 'shift-evening', name: 'Evening', startTime: '17:00', endTime: '22:00',
      breakMinutes: 0, isActive: true,
    },
    assignments: [{
      id: 'assignment-day',
      workDate: new Date('2026-10-29T00:00:00.000Z'),
      shift: { startTime: '09:00', endTime: '17:00' },
    }],
  });
  const result = await service.createAssignment(
    makeAssignmentDto({ shiftId: 'shift-evening' }),
    managerActor,
  );
  assert.equal(result.shiftId, 'shift-evening');
});

test('maps transaction serialization failures to a conflict', async () => {
  const transactionError = new Prisma.PrismaClientKnownRequestError('write conflict', {
    code: 'P2034', clientVersion: '5.22.0',
  });
  const { service } = makeAssignmentService({ transactionError });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto(), managerActor),
    ConflictException,
  );
});

test('maps the assignment unique constraint to a conflict', async () => {
  const uniqueError = new Prisma.PrismaClientKnownRequestError('unique constraint', {
    code: 'P2002', clientVersion: '5.22.0',
  });
  const { service } = makeAssignmentService({ transactionError: uniqueError });
  await assert.rejects(
    service.createAssignment(makeAssignmentDto(), managerActor),
    ConflictException,
  );
});
