require('ts-node/register');

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { BadRequestException, ConflictException, NotFoundException } = require('@nestjs/common');
const { Prisma } = require('@prisma/client');
const { CreateShiftDto } = require('./dto/create-shift.dto');
const { UpdateShiftDto } = require('./dto/update-shift.dto');
const { ShiftsService } = require('./shifts.service');

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
