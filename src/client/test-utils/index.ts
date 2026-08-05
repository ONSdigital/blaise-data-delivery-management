const flushPromisesOnce = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

// Some tests trigger work that schedules a follow-up promise chain from the first flush,
// so callers need two event-loop turns before assertions see the settled UI state.
const flushPromises = (): Promise<void> => flushPromisesOnce().then(flushPromisesOnce);

export default flushPromises;
