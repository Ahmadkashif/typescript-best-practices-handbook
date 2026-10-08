import closeWithGrace from 'close-with-grace';
import { buildApp } from '#src/app.ts';
import { loadConfig } from '#src/config/env.ts';
import { createContainer } from '#src/container.ts';

/** Process entrypoint: the only file with side effects at import time. */
async function main(): Promise<void> {
  const config = loadConfig(process.env);
  const container = createContainer(config);
  const app = await buildApp(container);

  // On SIGTERM/SIGINT or a fatal error: fail readiness, drain in-flight requests,
  // run onClose hooks, and force-exit if that takes longer than the grace period.
  closeWithGrace({ delay: config.SHUTDOWN_GRACE_MS, logger: app.log }, async ({ signal, err }) => {
    if (err) app.log.fatal({ err }, 'fatal error, shutting down');
    else app.log.info({ signal }, 'shutdown signal received');
    container.lifecycle.beginShutdown();
    await app.close();
    app.log.info('shutdown complete');
  });

  await app.listen({ host: config.HOST, port: config.PORT });
}

main().catch((error: unknown) => {
  // The logger may not exist yet (e.g. invalid config), so write one JSON line to stderr.
  const err =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;
  process.stderr.write(`${JSON.stringify({ level: 'fatal', msg: 'startup failed', err })}\n`);
  process.exitCode = 1;
});
