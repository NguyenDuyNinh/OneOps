require('ts-node/register');

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { BadRequestException, NotFoundException } = require('@nestjs/common');
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
