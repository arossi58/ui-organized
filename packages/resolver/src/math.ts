/**
 * A tiny, sandboxed arithmetic evaluator for `$value` math expressions.
 *
 * Grammar (recursive descent):
 *   expr   := term (('+' | '-') term)*
 *   term   := factor (('*' | '/') factor)*
 *   factor := '-' factor | '(' expr ')' | number
 *   number := digits ['.' digits] [unit]
 *
 * It NEVER uses `eval`/`Function`. Anything outside this grammar — identifiers,
 * function calls, stray characters — is rejected as a typed error. References
 * must be substituted with their resolved numeric/unit values before evaluation;
 * the evaluator itself knows nothing about references.
 *
 * Units use simple dimensional algebra: add/sub require compatible units,
 * multiply allows at most one unit, divide cancels equal units. Incompatible
 * combinations and divide-by-zero return a typed error.
 */

export type EvalResult =
  | { ok: true; value: number; unit: string }
  | { ok: false; reason: string };

interface NumToken {
  type: "num";
  value: number;
  unit: string;
}
interface OpToken {
  type: "op";
  op: "+" | "-" | "*" | "/";
}
interface ParenToken {
  type: "paren";
  paren: "(" | ")";
}
type Token = NumToken | OpToken | ParenToken;

class MathError extends Error {}

const NUMBER_RE = /^(\d+\.?\d*|\.\d+)([a-z%]*)/i;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.trim();
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === " " || ch === "\t" || ch === "\n") {
      i++;
      continue;
    }
    if (ch === "+" || ch === "*" || ch === "/" || ch === "-") {
      tokens.push({ type: "op", op: ch });
      i++;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", paren: ch });
      i++;
      continue;
    }
    const rest = s.slice(i);
    const m = NUMBER_RE.exec(rest);
    if (m && m.index === 0) {
      tokens.push({ type: "num", value: parseFloat(m[1]!), unit: m[2] ?? "" });
      i += m[0].length;
      continue;
    }
    throw new MathError(`unexpected character "${ch}"`);
  }
  return tokens;
}

interface Value {
  value: number;
  unit: string;
}

function add(a: Value, b: Value, sign: 1 | -1): Value {
  if (a.unit && b.unit && a.unit !== b.unit) {
    throw new MathError(`cannot ${sign === 1 ? "add" : "subtract"} ${a.unit} and ${b.unit}`);
  }
  return { value: a.value + sign * b.value, unit: a.unit || b.unit };
}

function multiply(a: Value, b: Value): Value {
  if (a.unit && b.unit) {
    throw new MathError(`cannot multiply ${a.unit} by ${b.unit}`);
  }
  return { value: a.value * b.value, unit: a.unit || b.unit };
}

function divide(a: Value, b: Value): Value {
  if (b.value === 0) throw new MathError("division by zero");
  if (a.unit && b.unit) {
    if (a.unit !== b.unit) throw new MathError(`cannot divide ${a.unit} by ${b.unit}`);
    return { value: a.value / b.value, unit: "" };
  }
  if (!a.unit && b.unit) throw new MathError(`cannot divide a number by ${b.unit}`);
  return { value: a.value / b.value, unit: a.unit };
}

class Parser {
  private pos = 0;
  constructor(private readonly tokens: Token[]) {}

  parse(): Value {
    if (this.tokens.length === 0) throw new MathError("empty expression");
    const result = this.expr();
    if (this.pos < this.tokens.length) throw new MathError("unexpected trailing input");
    return result;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private expr(): Value {
    let left = this.term();
    let tok = this.peek();
    while (tok && tok.type === "op" && (tok.op === "+" || tok.op === "-")) {
      this.pos++;
      const right = this.term();
      left = add(left, right, tok.op === "+" ? 1 : -1);
      tok = this.peek();
    }
    return left;
  }

  private term(): Value {
    let left = this.factor();
    let tok = this.peek();
    while (tok && tok.type === "op" && (tok.op === "*" || tok.op === "/")) {
      this.pos++;
      const right = this.factor();
      left = tok.op === "*" ? multiply(left, right) : divide(left, right);
      tok = this.peek();
    }
    return left;
  }

  private factor(): Value {
    const tok = this.peek();
    if (!tok) throw new MathError("unexpected end of expression");
    if (tok.type === "op" && tok.op === "-") {
      this.pos++;
      const inner = this.factor();
      return { value: -inner.value, unit: inner.unit };
    }
    if (tok.type === "op" && tok.op === "+") {
      this.pos++;
      return this.factor();
    }
    if (tok.type === "paren" && tok.paren === "(") {
      this.pos++;
      const inner = this.expr();
      const close = this.peek();
      if (!close || close.type !== "paren" || close.paren !== ")") {
        throw new MathError("missing closing parenthesis");
      }
      this.pos++;
      return inner;
    }
    if (tok.type === "num") {
      this.pos++;
      return { value: tok.value, unit: tok.unit };
    }
    throw new MathError("expected a number or parenthesis");
  }
}

/**
 * Evaluates an arithmetic expression string (with references already
 * substituted) into a numeric value and unit, or a typed error.
 */
export function evaluateExpression(expr: string): EvalResult {
  try {
    const { value, unit } = new Parser(tokenize(expr)).parse();
    if (!Number.isFinite(value)) return { ok: false, reason: "non-finite result" };
    return { ok: true, value, unit };
  } catch (error) {
    if (error instanceof MathError) return { ok: false, reason: error.message };
    return { ok: false, reason: "invalid expression" };
  }
}

/**
 * True when a string looks like an arithmetic expression (contains a top-level
 * operator), as opposed to a bare literal like `"16px"` or `"-4px"`. A leading
 * sign on an otherwise plain number is not considered an expression.
 */
export function looksLikeExpression(value: string): boolean {
  // Strip a single leading sign, then look for any remaining operator.
  const body = value.trim().replace(/^[+-]/, "");
  return /[+\-*/]/.test(body) || value.includes("(");
}
