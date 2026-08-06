const flushPromisesOnce = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const flushPromises = (): Promise<void> => flushPromisesOnce().then(flushPromisesOnce);

export default flushPromises;
