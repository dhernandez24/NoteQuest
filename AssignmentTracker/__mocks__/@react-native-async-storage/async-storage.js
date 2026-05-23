const mockStorage = {};

export default {
  setItem: jest.fn((key, value) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key) => Promise.resolve(mockStorage[key] || null)),
  removeItem: jest.fn((key) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorage = {};
    return Promise.resolve();
  }),
};
