// Logger leve, sem dependências, que roda no servidor e no navegador.
//
// Hoje só escreve no console. Pra enviar os eventos a um serviço de monitoramento
// (ex.: GlitchTip/Sentry) no futuro, registre um sink com `registerLogSink` — nenhum
// ponto de chamada precisa mudar.

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface SerializedError {
  name: string;
  message: string;
  status?: number;
  digest?: string;
  stack?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: SerializedError;
}

export type LogSink = (entry: LogEntry) => void;

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function resolveMinLevel(): LogLevel {
  const configured = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (configured && configured in LEVEL_ORDER) return configured as LogLevel;
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
}

const minLevel = resolveMinLevel();

// Nada disso pode sair do dispositivo/servidor num log: tokens, senhas, e-mail
// (dado pessoal) e coordenadas (localização do usuário no "perto de mim").
const SENSITIVE_KEY = /token|password|senha|authorization|secret|cookie|email|^(lat|lng|latitude|longitude)$/i;
const MAX_REDACT_DEPTH = 4;

function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_REDACT_DEPTH) return "[truncado]";
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, SENSITIVE_KEY.test(key) ? "[redigido]" : redact(inner, depth + 1)]),
    );
  }
  return value;
}

function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const extra = error as Error & { status?: number; digest?: string };
    return {
      name: error.name,
      message: error.message,
      status: extra.status,
      digest: extra.digest,
      stack: error.stack,
    };
  }
  return { name: "NonError", message: typeof error === "string" ? error : JSON.stringify(redact(error)) };
}

const sinks = new Set<LogSink>();

export function registerLogSink(sink: LogSink) {
  sinks.add(sink);
  return () => {
    sinks.delete(sink);
  };
}

function writeToConsole({ level, message, context, error }: LogEntry) {
  const details = { ...(context ? { context } : {}), ...(error ? { error } : {}) };
  if (Object.keys(details).length > 0) console[level](`[sunsetsss] ${message}`, details);
  else console[level](`[sunsetsss] ${message}`);
}

function emit(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context: redact(context) as Record<string, unknown> } : {}),
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };

  writeToConsole(entry);
  for (const sink of sinks) {
    // Um sink quebrado nunca pode derrubar a aplicação (nem gerar loop de log).
    try {
      sink(entry);
    } catch {}
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit("warn", message, context),
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => emit("error", message, context, error),
};
