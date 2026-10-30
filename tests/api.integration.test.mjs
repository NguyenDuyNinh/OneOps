import test, { before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import modules from "../modules.json" with { type: "json" };
import { databaseUrl, cleanDatabase } from "../apps/api/test/database.mjs";
let app, origin, createApp;
const statuses = {
  "workspace-today": "Đang dùng",
  tasks: "Cần làm",
  "project-spaces": "Lên kế hoạch",
  calendar: "Đã lên lịch",
  "tickets-approvals": "Chờ duyệt",
  "internal-chat": "Đang mở",
  "knowledge-sop": "Bản nháp",
  reports: "Bản nháp",
};
const input = (module = "tasks", patch = {}) => ({
  code: "WORK-01",
  name: "Công việc kiểm thử",
  date: "2026-11-15",
  status: statuses[module],
  fields: {},
  ...patch,
});
async function request(route, method = "GET", body) {
  const response = await fetch(`${origin}/api/v1${route}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json() };
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(check, predicate, timeout = 3000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await check();
    if (predicate(value)) return value;
    await sleep(25);
  }
  throw new Error("Timed out waiting for notifications");
}
before(async () => {
  const migration = spawnSync(
    process.execPath,
    [
      "node_modules/prisma/build/index.js",
      "migrate",
      "deploy",
      "--config",
      "packages/database/prisma.config.ts",
    ],
    { env: { ...process.env, DATABASE_URL: databaseUrl }, encoding: "utf8" },
  );
  assert.equal(migration.status, 0, migration.stderr);
  process.env.DATABASE_URL = databaseUrl;
  process.env.NODE_ENV = "test";
  ({ createApp } = await import("../apps/api/dist/bootstrap.js"));
  app = await createApp();
  await app.listen(0, "127.0.0.1");
  origin = await app.getUrl();
});
after(async () => {
  await app?.close();
});
beforeEach(cleanDatabase);
test("data implementations own separate CRUD APIs, codes, records and namespaces", async () => {
  for (const module of modules.filter(
    (module) => module.route !== "notifications",
  )) {
    const created = await request(
      "/" + module.route,
      "POST",
      input(module.name),
    );
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.module, module.route);
    const list = await request("/" + module.route);
    assert.equal(list.body.total, 1);
    assert.equal(list.body.items[0].id, created.body.id);
  }
  const task = (await request("/tasks")).body.items[0];
  assert.equal((await request("/projects/" + task.id)).status, 404);
});
test("duplicate codes conflict; PATCH keeps omitted fields and stale writes are rejected", async () => {
  const created = (
    await request(
      "/tasks",
      "POST",
      input("tasks", {
        note: "Mô tả giữ nguyên",
        fields: { priority: "Cao", progress: 20 },
      }),
    )
  ).body;
  assert.equal(
    (await request("/tasks", "POST", input("tasks", { code: " work-01 " })))
      .status,
    409,
  );
  const saved = await request("/tasks/" + created.id, "PATCH", {
    version: 1,
    status: "Đang thực hiện",
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.note, "Mô tả giữ nguyên");
  assert.equal(saved.body.fields.priority, "Cao");
  assert.equal(saved.body.version, 2);
  assert.equal(
    (
      await request("/tasks/" + created.id, "PATCH", {
        version: 1,
        status: "Hoàn thành",
      })
    ).status,
    409,
  );
  assert.equal(
    (await request("/tasks/" + created.id, "DELETE", { version: 1 })).status,
    409,
  );
  assert.equal(
    (await request("/tasks/" + created.id, "DELETE", { version: 2 })).status,
    200,
  );
});
test("strict domain validation rejects foreign fields, invalid status, dates and progress", async () => {
  for (const patch of [
    { name: " " },
    { status: "Không hợp lệ" },
    { date: "2026-02-30" },
    { fields: { progress: 101 } },
    { fields: { beneficiary: "Không phải domain công việc" } },
    { fields: { priority: "Unknown" } },
  ])
    assert.equal(
      (await request("/tasks", "POST", input("tasks", patch))).status,
      400,
    );
  assert.equal(
    (
      await request(
        "/tasks",
        "POST",
        input("tasks", { fields: { startDate: "2026-12-01" } }),
      )
    ).status,
    400,
  );
  const task = (await request("/tasks", "POST", input())).body;
  assert.equal(
    (
      await request("/tasks/" + task.id, "PATCH", {
        version: 1,
        fields: { startDate: "2026-12-01" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        "/calendar",
        "POST",
        input("calendar", { fields: { startTime: "11:00", endTime: "10:00" } }),
      )
    ).status,
    400,
  );
  const event = (
    await request(
      "/calendar",
      "POST",
      input("calendar", { fields: { startTime: "10:00", endTime: "11:00" } }),
    )
  ).body;
  assert.equal(
    (
      await request("/calendar/" + event.id, "PATCH", {
        version: 1,
        fields: { startTime: "11:00", endTime: "10:00" },
      })
    ).status,
    400,
  );
});
test("checklists and comments persist as structured task data", async () => {
  const task = (await request("/tasks", "POST", input())).body;
  const id = crypto.randomUUID();
  const result = await request("/tasks/" + task.id, "PATCH", {
    version: 1,
    fields: {
      checklist: [{ id, title: "Kiểm tra bàn giao", done: true }],
      comments: [
        {
          id: crypto.randomUUID(),
          text: "Đã xác nhận",
          author: "Người kiểm thử",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.fields.checklist[0].done, true);
  assert.equal(
    (await request("/tasks/" + task.id)).body.fields.comments[0].text,
    "Đã xác nhận",
  );
});
test("pagination, search, status and assignee filters stay within their domain", async () => {
  await request(
    "/tasks",
    "POST",
    input("tasks", {
      code: "TASK-A",
      name: "Thiết kế giao diện",
      assignee: "An",
    }),
  );
  await request(
    "/tasks",
    "POST",
    input("tasks", {
      code: "TASK-B",
      name: "Kiểm thử",
      status: "Hoàn thành",
      assignee: "Bình",
    }),
  );
  assert.equal(
    (await request("/tasks?page=1&pageSize=1")).body.items.length,
    1,
  );
  assert.equal(
    (await request("/tasks?q=" + encodeURIComponent("giao diện"))).body.total,
    1,
  );
  assert.equal(
    (await request("/tasks?status=" + encodeURIComponent("Hoàn thành"))).body
      .total,
    1,
  );
  assert.equal((await request("/tasks?assignee=An")).body.total, 1);
  assert.equal((await request("/projects")).body.total, 0);
});
test("only one concurrent write can use the same task version", async () => {
  const task = (await request("/tasks", "POST", input())).body;
  const results = await Promise.all([
    request("/tasks/" + task.id, "PATCH", { version: 1, status: "Hoàn thành" }),
    request("/tasks/" + task.id, "PATCH", {
      version: 1,
      status: "Chờ phản hồi",
    }),
  ]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
});
test("workspace aggregates every task page and real project/request/calendar data", async () => {
  for (let i = 0; i < 101; i++)
    assert.equal(
      (
        await request(
          "/tasks",
          "POST",
          input("tasks", {
            code: "TASK-" + i,
            date: "2000-01-01",
            status: i < 50 ? "Hoàn thành" : "Cần làm",
          }),
        )
      ).status,
      201,
    );
  await request("/projects", "POST", input("project-spaces"));
  await request("/requests", "POST", input("tickets-approvals"));
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  await request("/calendar", "POST", input("calendar", { date }));
  const summary = (await request("/workspace/summary")).body;
  assert.equal(summary.totalTasks, 101);
  assert.equal(summary.completedTasks, 50);
  assert.equal(summary.overdueTasks, 51);
  assert.equal(summary.projects, 1);
  assert.equal(summary.pendingRequests, 1);
  assert.equal(summary.todayEvents, 1);
  assert.equal(summary.tasks.length, 8);
});
test("records survive a Nest restart; former legal routes no longer exist", async () => {
  const task = (await request("/tasks", "POST", input())).body;
  await app.close();
  app = await createApp();
  await app.listen(0, "127.0.0.1");
  origin = await app.getUrl();
  assert.equal((await request("/tasks/" + task.id)).body.name, task.name);
  assert.equal((await request("/manage-information")).status, 404);
  assert.equal((await request("/teams")).status, 404);
  assert.equal((await request("/case-transfers", "POST", {})).status, 404);
});
test("task, comment, message and meeting events create notifications with navigation links", async () => {
  const recipient = "Lan";
  const inbox = () =>
    request(`/notifications?recipient=${encodeURIComponent(recipient)}`);
  const task = (
    await request("/tasks", "POST", input("tasks", { assignee: recipient }))
  ).body;
  let list = await waitFor(inbox, (result) => result.body.total >= 1);
  assert.equal(list.body.items[0].source, "task");
  assert.equal(list.body.items[0].sourceId, task.id);
  assert.equal(
    list.body.items[0].link,
    `/work-management/tasks?focus=${task.id}`,
  );
  assert.equal(list.body.unread, 1);

  await request("/tasks/" + task.id, "PATCH", {
    version: 1,
    status: "Đang thực hiện",
  });
  list = await waitFor(inbox, (result) => result.body.total >= 2);
  assert.ok(
    list.body.items.some(
      (item) => item.source === "task" && item.body.includes("Đang thực hiện"),
    ),
  );

  await request("/tasks/" + task.id, "PATCH", {
    version: 2,
    fields: {
      comments: [
        {
          id: crypto.randomUUID(),
          text: "Đã xong phần API",
          author: "Minh",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  });
  list = await waitFor(inbox, (result) => result.body.total >= 3);
  assert.ok(
    list.body.items.some(
      (item) => item.source === "comment" && item.body.includes("Minh"),
    ),
  );

  const thread = (
    await request(
      "/messages",
      "POST",
      input("internal-chat", {
        assignee: recipient,
        fields: { participants: "Lan, Minh" },
      }),
    )
  ).body;
  list = await waitFor(inbox, (result) => result.body.total >= 4);
  assert.ok(
    list.body.items.some(
      (item) => item.source === "message" && item.sourceId === thread.id,
    ),
  );

  const meeting = (
    await request(
      "/calendar",
      "POST",
      input("calendar", {
        assignee: recipient,
        fields: {
          kind: "Cuộc họp",
          startTime: "09:00",
          endTime: "10:00",
          attendees: "Lan, Minh",
        },
      }),
    )
  ).body;
  list = await waitFor(inbox, (result) => result.body.total >= 5);
  assert.ok(
    list.body.items.some(
      (item) => item.source === "meeting" && item.sourceId === meeting.id,
    ),
  );

  const notification = list.body.items[0];
  const read = await request(`/notifications/${notification.id}/read`, "PATCH");
  assert.equal(read.status, 200);
  assert.ok(read.body.readAt);
  assert.equal(
    (await request(`/notifications/${notification.id}/read`, "PATCH")).status,
    200,
  );
  const all = await request("/notifications/read-all", "PATCH", { recipient });
  assert.equal(all.status, 200);
  assert.equal(
    (
      await request(
        `/notifications?recipient=${encodeURIComponent(recipient)}&unread=true`,
      )
    ).body.total,
    0,
  );

  // Deleting the source task soft-deletes linked notifications (hidden from UI, preserved in DB)
  const taskNotification = list.body.items.find(
    (item) => item.sourceId === task.id,
  );
  assert.ok(taskNotification);
  const currentTask = (await request(`/tasks/${task.id}`)).body;
  const deleteTask = await request(`/tasks/${task.id}`, "DELETE", {
    version: currentTask.version,
  });
  assert.equal(deleteTask.status, 200);
  list = await waitFor(
    inbox,
    (result) => !result.body.items.some((item) => item.sourceId === task.id),
  );
  assert.equal(
    list.body.items.some((item) => item.sourceId === task.id),
    false,
  );

  // Verified: The notification record is retained in database for audit checks
  const archived = await request(`/notifications/${taskNotification.id}`);
  assert.equal(archived.status, 200);
  assert.ok(archived.body.deletedAt);

  // Direct DELETE /notifications/:id soft-deletes the notification
  const remainingNotif = list.body.items[0];
  if (remainingNotif) {
    const delNotif = await request(
      `/notifications/${remainingNotif.id}`,
      "DELETE",
    );
    assert.equal(delNotif.status, 200);
    assert.ok(delNotif.body.deletedAt);
    const afterDel = await request(
      `/notifications?recipient=${encodeURIComponent(recipient)}`,
    );
    assert.equal(
      afterDel.body.items.some((item) => item.id === remainingNotif.id),
      false,
    );

    // Verified: Retained in database with deletedAt timestamp
    const checked = await request(`/notifications/${remainingNotif.id}`);
    assert.equal(checked.status, 200);
    assert.ok(checked.body.deletedAt);
  }
});
test("notification stream pushes new notifications over SSE", async () => {
  const controller = new AbortController();
  const response = await fetch(
    `${origin}/api/v1/notifications/stream?recipient=Lan`,
    { signal: controller.signal },
  );
  assert.match(
    response.headers.get("content-type") ?? "",
    /text\/event-stream/,
  );
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const created = await request(
      "/tasks",
      "POST",
      input("tasks", { assignee: "Lan" }),
    );
    assert.equal(created.status, 201);
    let buffer = "";
    while (!buffer.includes("event: notification\n")) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }
    assert.match(buffer, /event: notification/);
    assert.match(buffer, new RegExp(created.body.id));

    // Deleting the task pushes notification_deleted over SSE
    await request(`/tasks/${created.body.id}`, "DELETE", {
      version: created.body.version,
    });
    while (!buffer.includes("event: notification_deleted")) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }
    assert.match(buffer, /event: notification_deleted/);
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
});
