import ts from "typescript";

// Keep architecture and reachability checks aligned across TypeScript import forms.
export function dependencySpecifier(node) {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
    return node.moduleSpecifier;
  if (
    ts.isImportEqualsDeclaration(node) &&
    ts.isExternalModuleReference(node.moduleReference)
  )
    return node.moduleReference.expression;
  if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
    return node.argument.literal;
  if (
    ts.isCallExpression(node) &&
    (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node.expression) && node.expression.text === "require"))
  )
    return node.arguments[0];
}

export function literalSpecifier(expression) {
  return expression &&
    (ts.isStringLiteral(expression) ||
      ts.isNoSubstitutionTemplateLiteral(expression))
    ? expression.text
    : undefined;
}
