const text = (value) => typeof value === "string" && value.trim().length > 0;

export const moduleKinds = ["records", "resource"];

export function moduleKind(entry) {
  return entry?.kind ?? "records";
}

export function ownedModels(entry) {
  const declared =
    entry?.models ?? (entry?.model === undefined ? [] : [entry.model]);
  return [...new Set(declared.filter(text))];
}

export function ownedSchemas(entry) {
  const declared =
    entry?.schemas ?? (entry?.schema === undefined ? [] : [entry.schema]);
  return [...new Set(declared.filter(text))];
}

export function delegateName(model) {
  return model[0].toLowerCase() + model.slice(1);
}

export function ownedDelegates(entry) {
  return ownedModels(entry).map(delegateName);
}

export function collectRegistryKeys(modules) {
  const namespaces = new Set(),
    routes = new Set(),
    models = new Set(),
    schemas = new Set();
  for (const entry of modules) {
    if (text(entry?.databaseSchema)) namespaces.add(entry.databaseSchema);
    if (text(entry?.route)) routes.add(entry.route);
    for (const model of ownedModels(entry)) models.add(model);
    for (const schema of ownedSchemas(entry)) schemas.add(schema);
  }
  return { namespaces, routes, models, schemas };
}

export function validateRegistry(modules) {
  const failures = [],
    seen = {
      names: new Set(),
      namespaces: new Set(),
      routes: new Set(),
      models: new Set(),
      schemas: new Set(),
    };
  if (!Array.isArray(modules)) return ["modules.json must contain an array"];
  modules.forEach((entry, index) => {
    const label = text(entry?.name)
      ? `module "${entry.name}"`
      : `modules[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      failures.push(`${label}: must be an object`);
      return;
    }
    for (const key of [
      "name",
      "feature",
      "route",
      "webRoute",
      "databaseSchema",
    ])
      if (!text(entry[key])) failures.push(`${label}: missing ${key}`);
    if (entry.frontend !== undefined && typeof entry.frontend !== "boolean")
      failures.push(`${label}: frontend must be boolean when present`);
    if (entry.kind !== undefined && !moduleKinds.includes(entry.kind))
      failures.push(
        `${label}: kind must be one of ${moduleKinds.join(", ")} when present`,
      );
    if (entry.model !== undefined && entry.models !== undefined)
      failures.push(`${label}: declare either model or models, not both`);
    if (entry.schema !== undefined && entry.schemas !== undefined)
      failures.push(`${label}: declare either schema or schemas, not both`);
    const models = ownedModels(entry),
      schemas = ownedSchemas(entry);
    if (!models.length) failures.push(`${label}: must own at least one model`);
    if (!schemas.length)
      failures.push(`${label}: must own at least one schema file`);
    const declaredModels = entry.models ?? (entry.model ? [entry.model] : []);
    const declaredSchemas =
      entry.schemas ?? (entry.schema ? [entry.schema] : []);
    if (declaredModels.length !== models.length)
      failures.push(`${label}: models must be unique, non-empty strings`);
    if (declaredSchemas.length !== schemas.length)
      failures.push(`${label}: schemas must be unique, non-empty strings`);
    for (const [set, value, kind] of [
      [seen.names, entry.name, "name"],
      [seen.namespaces, entry.databaseSchema, "namespace"],
      [seen.routes, entry.route, "API route"],
    ]) {
      if (!text(value)) continue;
      if (set.has(value)) failures.push(`${label}: duplicate ${kind} ${value}`);
      set.add(value);
    }
    for (const model of models) {
      if (seen.models.has(model))
        failures.push(`${label}: duplicate model ${model}`);
      seen.models.add(model);
    }
    for (const schema of schemas) {
      if (seen.schemas.has(schema))
        failures.push(`${label}: duplicate schema ${schema}`);
      seen.schemas.add(schema);
    }
  });
  return failures;
}
