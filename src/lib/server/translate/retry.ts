const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 1000;

/**
 * Executes `fn`, retrying on 429/503 with exponential backoff + jitter.
 * Throws on non-retryable errors or after all attempts are exhausted.
 */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
	let lastError: Error = new Error('Unknown error');

	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		try {
			return await fn();
		} catch (e) {
			lastError = e as Error;
			const msg = lastError.message.toLowerCase();
			const isRetryable =
				msg.includes('429') || msg.includes('too many') || msg.includes('503') || msg.includes('rate');

			if (!isRetryable || attempt === MAX_ATTEMPTS - 1) throw lastError;

			const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 500;
			await new Promise((r) => setTimeout(r, delay));
		}
	}

	throw lastError;
}
